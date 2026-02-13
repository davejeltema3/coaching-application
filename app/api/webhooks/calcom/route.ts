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

    // Get ALL data - use A:ZZ to get every possible column, 500 rows
    // This bypasses Google's "smart" detection of data boundaries
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Form Responses 1!A:ZZ', // All columns, all rows
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const allRows = response.data.values || [];
    
    // Filter out completely empty rows (all cells null/empty)
    const rows = allRows.filter(row => 
      row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
    );
    
    console.log('=== SHEETS API DEBUG ===');
    console.log('Total rows from API:', allRows.length);
    console.log('Total rows after filtering empty:', rows.length);
    console.log('Range requested: Form Responses 1!A:ZZ (all columns, all rows)');
    console.log('Row 17 exists?', rows[16] ? 'YES' : 'NO');
    console.log('Row 50 exists?', rows[49] ? 'YES' : 'NO');
    console.log('=== END SHEETS DEBUG ===');
    
    // Find column indices from header row
    const headers = rows[0] || [];
    const emailColumnIndex = headers.indexOf('Email');
    const callBookedColumnIndex = headers.indexOf('Call Booked');
    const statusColumnIndex = headers.indexOf('Status');
    
    if (emailColumnIndex === -1 || callBookedColumnIndex === -1) {
      console.error('Required columns not found in sheet');
      // Return 200 to avoid Cal.com marking webhook as broken
      return NextResponse.json({ error: 'Sheet columns not found' }, { status: 200 });
    }
    
    // Debug: Log all emails in sheet
    console.log('Looking for email:', email);
    console.log('Emails in "Email" column:', rows.slice(1).map(r => r[emailColumnIndex]).filter(Boolean));
    
    // Find the row with matching email - search ALL columns since form structure may have changed
    let rowIndex = -1;
    let foundColumnIndex = -1;
    
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
      const searchEmail = email.trim().toLowerCase();
      
      // Search every column in this row for the email
      for (let colIndex = 0; colIndex < (rows[i]?.length || 0); colIndex++) {
        const cellValue = rows[i][colIndex]?.toString().trim().toLowerCase();
        
        if (cellValue === searchEmail) {
          rowIndex = i;
          foundColumnIndex = colIndex;
          console.log(`Found email in row ${i}, column ${colIndex}: "${rows[i][colIndex]}"`);
          break;
        }
      }
      
      if (rowIndex !== -1) break;
    }

    if (rowIndex === -1) {
      console.error('Email not found in sheet:', email);
      // Return 200 anyway - Cal.com considers non-200 a failure
      return NextResponse.json({ error: 'Email not found', email }, { status: 200 });
    }

    // Prepare updates for both Call Booked and Status columns
    const updates = [];
    
    // Update "Call Booked" column
    const callBookedLetter = String.fromCharCode(65 + callBookedColumnIndex);
    const callBookedRange = `Form Responses 1!${callBookedLetter}${rowIndex + 1}`;
    updates.push({
      range: callBookedRange,
      values: [['✓']],
    });
    
    // Update "Status" column if it exists
    if (statusColumnIndex !== -1) {
      const statusLetter = String.fromCharCode(65 + statusColumnIndex);
      const statusRange = `Form Responses 1!${statusLetter}${rowIndex + 1}`;
      updates.push({
        range: statusRange,
        values: [['Call Booked']],
      });
    }
    
    // Batch update both cells
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    });

    console.log(`Updated row ${rowIndex + 1} - Call Booked = ✓, Status = Call Booked for ${email}`);

    return NextResponse.json({ success: true, email, row: rowIndex + 1 });
  } catch (error) {
    console.error('Cal.com webhook error:', error);
    // Return 200 to avoid Cal.com marking webhook as broken
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 200 });
  }
}
