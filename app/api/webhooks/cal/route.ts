import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Cal.com sends booking data - extract email from attendees
    const attendees = payload.attendees || payload.responses?.attendees || [];
    const email = attendees[0]?.email || payload.responses?.email;
    
    if (!email) {
      console.error('No email found in Cal.com webhook payload');
      return NextResponse.json({ error: 'No email' }, { status: 400 });
    }

    console.log('Cal.com booking received for:', email);

    if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      console.error('Google Sheets credentials not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
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

    // Get all rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Form Responses 1!A:Z', // Get all columns
    });

    const rows = response.data.values || [];
    
    // Find column indices from header row
    const headers = rows[0] || [];
    const emailColumnIndex = headers.indexOf('Email');
    const callBookedColumnIndex = headers.indexOf('Call Booked');
    
    if (emailColumnIndex === -1 || callBookedColumnIndex === -1) {
      console.error('Required columns not found in sheet');
      return NextResponse.json({ error: 'Sheet columns not found' }, { status: 500 });
    }
    
    // Find the row with matching email
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
      if (rows[i][emailColumnIndex]?.toLowerCase() === email.toLowerCase()) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      console.error('Email not found in sheet:', email);
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
