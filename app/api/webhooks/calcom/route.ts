import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

// Handle both escaped and literal newlines
let PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
if (PRIVATE_KEY.includes('\\n')) {
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

// Debug: Log key format (first 50 chars only for security)
console.log('Private key starts with:', PRIVATE_KEY.substring(0, 50));
console.log('Private key ends with:', PRIVATE_KEY.substring(PRIVATE_KEY.length - 50));

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    console.log('=== RAW WEBHOOK BODY ===');
    console.log(rawBody);
    console.log('=== END RAW BODY ===');
    
    const payload = JSON.parse(rawBody);
    console.log('=== PARSED PAYLOAD ===');
    console.log(JSON.stringify(payload, null, 2));
    console.log('=== END PARSED ===');
    
    // Handle Cal.com ping test
    if (payload.triggerEvent === 'PING' || payload.test === true) {
      console.log('Cal.com ping test received');
      return NextResponse.json({ success: true, message: 'Ping received' });
    }
    
    // Cal.com sends booking data - try multiple paths
    let email = null;
    
    // Try different payload structures
    if (payload.attendees && payload.attendees.length > 0) {
      email = payload.attendees[0].email;
    } else if (payload.responses?.email) {
      email = payload.responses.email;
    } else if (payload.payload?.attendees && payload.payload.attendees.length > 0) {
      email = payload.payload.attendees[0].email;
    } else if (payload.payload?.responses?.email) {
      email = payload.payload.responses.email;
    }
    
    if (!email) {
      console.error('No email found in Cal.com webhook payload. Full payload:', payload);
      // Still return 200 to avoid failing Cal.com's webhook validation
      return NextResponse.json({ error: 'No email', payload }, { status: 200 });
    }

    console.log('Cal.com booking received for:', email);

    if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      console.error('Google Sheets credentials not configured');
      // Return 200 to avoid Cal.com marking webhook as broken
      return NextResponse.json({ error: 'Server not configured' }, { status: 200 });
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: SERVICE_ACCOUNT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get all rows from the sheet (explicit large range to avoid API limiting)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Form Responses 1!A1:Z1000', // Explicit range to get first 1000 rows
      valueRenderOption: 'UNFORMATTED_VALUE', // Get raw values
    });

    const rows = response.data.values || [];
    
    console.log('=== SHEETS API DEBUG ===');
    console.log('Total rows returned:', rows.length);
    console.log('Range requested:', 'Form Responses 1!A1:Z1000');
    console.log('First 3 rows:', JSON.stringify(rows.slice(0, 3)));
    console.log('Last 3 rows:', JSON.stringify(rows.slice(-3)));
    console.log('=== END SHEETS DEBUG ===');
    
    // Find column indices from header row
    const headers = rows[0] || [];
    const emailColumnIndex = headers.indexOf('Email');
    const callBookedColumnIndex = headers.indexOf('Call Booked');
    
    if (emailColumnIndex === -1 || callBookedColumnIndex === -1) {
      console.error('Required columns not found in sheet');
      // Return 200 to avoid Cal.com marking webhook as broken
      return NextResponse.json({ error: 'Sheet columns not found' }, { status: 200 });
    }
    
    // Debug: Log all emails in sheet
    console.log('Looking for email:', email);
    console.log('Emails in sheet:', rows.slice(1).map(r => r[emailColumnIndex]).filter(Boolean));
    
    // Find the row with matching email
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
      const sheetEmail = rows[i][emailColumnIndex]?.trim().toLowerCase();
      const searchEmail = email.trim().toLowerCase();
      
      console.log(`Comparing row ${i}: "${sheetEmail}" vs "${searchEmail}"`);
      
      if (sheetEmail === searchEmail) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.error('Email not found in sheet:', email);
      // Return 200 anyway - Cal.com considers non-200 a failure
      return NextResponse.json({ error: 'Email not found', email }, { status: 200 });
    }

    // Convert column index to letter (0=A, 1=B, etc.)
    const columnLetter = String.fromCharCode(65 + callBookedColumnIndex);
    const cellRange = `Form Responses 1!${columnLetter}${rowIndex + 1}`;
    
    // Update the "Call Booked" cell to ✓
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: cellRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['✓']],
      },
    });

    console.log(`Updated row ${rowIndex + 1} - Call Booked = ✓ for ${email}`);

    return NextResponse.json({ success: true, email, row: rowIndex + 1 });
  } catch (error) {
    console.error('Cal.com webhook error:', error);
    // Return 200 to avoid Cal.com marking webhook as broken
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 200 });
  }
}
