## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# JobNest Project

A modern job portal application built with React, TypeScript, and Tailwind CSS, with realistic company verification.

## Features

- Job seeker and employer registration
- Company email domain verification
- Modern UI with responsive design
- Form validation with Zod
- Toast notifications


## Company Email Verification

The application uses email domain verification to confirm company affiliation - a realistic and industry-standard approach used by platforms like LinkedIn.

### How It Works

1. **Company Name**: User enters their company name
2. **Company Email**: User provides their company email address
3. **Domain Verification**: System checks if email domain matches company name
4. **Verification**: Confirms user's affiliation with the company

### Verification Process

#### **Step 1: Enter Company Information**
- Company name (e.g., "Acme Corporation")
- Company email (e.g., "john@acmecorp.com")

#### **Step 2: Domain Matching**
- System extracts domain from email (@acmecorp.com)
- Checks if domain contains company name keywords
- Validates domain-company name correlation

#### **Step 3: Verification Status**
- **✅ Verified**: Domain matches company name
- **❌ Failed**: Domain doesn't match company name
- **🔄 Verifying**: Processing verification

### Examples of Valid Company Emails

| Company Name | Valid Email | Domain Match |
|--------------|-------------|--------------|
| Acme Corporation | john@acmecorp.com | ✅ acmecorp matches Acme |
| Tech Startup | sarah@techstartup.in | ✅ techstartup matches Tech Startup |
| Infosys | rahul@infosys.com | ✅ infosys matches Infosys |
| Tata Consultancy | priya@tcs.com | ✅ tcs matches Tata Consultancy |

### Benefits

✅ **Realistic**: Industry-standard verification method
✅ **Simple**: No complex APIs or external dependencies
✅ **Universal**: Works for any company with a domain
✅ **Secure**: Based on actual company email ownership
✅ **User-Friendly**: Familiar verification process
✅ **No Cost**: Completely free to implement

### Technical Implementation

The verification system:
- Extracts email domain using JavaScript
- Performs keyword matching between domain and company name
- Handles common domain variations (.com, .in, .org, etc.)
- Provides real-time feedback during verification
- Stores verification status in user profile

## Development

The application uses:
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **Lucide React** for icons

## Company Verification Features

The employer signup process includes realistic company verification:
- **Email Domain Verification**: Industry-standard approach
- **Real-time Feedback**: Immediate verification status
- **User-Friendly**: Simple and intuitive process
- **Secure**: Based on actual company email ownership
- **No External Dependencies**: Self-contained verification

### Verification Flow

1. **Company Name Input**: User enters company name
2. **Company Email Input**: User provides company email
3. **Verification Button**: Click to verify email domain
4. **Status Display**: Shows verification result
5. **Success/Failure**: Clear feedback with next steps

### User Experience

- **Clear Instructions**: Helpful tooltips and guidance
- **Visual Feedback**: Color-coded status indicators
- **Error Handling**: Helpful error messages
- **Retry Options**: Easy to retry failed verifications
- **Change Options**: Ability to modify information


