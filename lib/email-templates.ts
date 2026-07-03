const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`

const headerHtml = `
  <div style="background: #1a1a1a; padding: 32px 24px; text-align: center;">
    <div style="display: inline-block; background: #ffffff; border-radius: 50px; padding: 10px 28px; margin-bottom: 8px;">
      <span style="font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1a1a; letter-spacing: 0.5px;">BookedByBri</span>
    </div>
    <p style="color: #ffabdd; font-size: 13px; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Braids by Brizee Bri · Pflugerville, TX</p>
  </div>
`

const footerHtml = `
  <div style="background: #1a1a1a; padding: 24px; text-align: center; margin-top: 0;">
    <p style="color: #8a8a8a; font-size: 12px; margin: 0 0 8px;">Questions? Reply to this email or DM us on Instagram.</p>
    <p style="color: #8a8a8a; font-size: 11px; margin: 0;">© Braids by Brizee Bri · Pflugerville, TX</p>
  </div>
`

function wrapEmail(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Braids by Brizee Bri</title>
</head>
<body style="margin: 0; padding: 0; background: #f2f2f0;">
  <div style="${baseStyle}">
    ${headerHtml}
    <div style="padding: 32px 24px; background: #ffffff;">
      ${content}
    </div>
    ${footerHtml}
  </div>
</body>
</html>
  `.trim()
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; color: #8a8a8a; font-size: 14px; width: 140px;">${label}</td>
      <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${value}</td>
    </tr>
  `
}

export function bookingReceived(clientName: string, serviceName: string, date: string, time: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Request received! ✨</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, we got your booking request and Bri will review it shortly.</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Service', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${infoRow('Status', 'Pending Review')}
      </table>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">Bri will send you a quote once she&apos;s reviewed your request. You&apos;ll receive another email with your final price and deposit details.</p>
  `)
}

export function quoteReady(clientName: string, serviceName: string, date: string, time: string, finalPrice: number, depositPaid: number, balanceDue: number, message: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Your quote is ready 💅</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, Bri has reviewed your request and sent you a quote!</p>
    ${message ? `<div style="border-left: 3px solid #ffabdd; padding: 12px 16px; background: #fff0f8; border-radius: 0 8px 8px 0; margin-bottom: 28px;"><p style="color: #7a2e58; font-size: 14px; font-style: italic; margin: 0;">&ldquo;${message}&rdquo;</p><p style="color: #c4658f; font-size: 12px; margin: 8px 0 0;">— Brizee Bri</p></div>` : ''}
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Service', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${infoRow('Total Price', `$${finalPrice.toFixed(2)}`)}
        ${infoRow('Deposit Paid', `$${depositPaid.toFixed(2)}`)}
        ${infoRow('Balance Due', `$${balanceDue.toFixed(2)}`)}
      </table>
    </div>
    <p style="color: #8a8a8a; font-size: 13px; text-align: center; margin: 0;">Balance is due on the day of your appointment.</p>
  `)
}

export function bookingConfirmed(clientName: string, serviceName: string, date: string, time: string, depositPaid: number, balanceDue: number): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">You&apos;re confirmed! 🎉</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, your appointment is officially confirmed. We can&apos;t wait to see you!</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Service', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${infoRow('Deposit Paid', `$${depositPaid.toFixed(2)}`)}
        ${balanceDue > 0 ? infoRow('Balance Due', `$${balanceDue.toFixed(2)} on appointment day`) : ''}
      </table>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">Need to make changes? Please reach out at least 48 hours before your appointment. See you soon! 💕</p>
  `)
}

export function bookingAccepted(clientName: string, serviceName: string, date: string, time: string, depositAmount: number, paymentInstructions: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">You&apos;re approved! 🎉</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, Bri has reviewed your request and would love to have you!</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Service', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${infoRow('Deposit due', `$${depositAmount.toFixed(2)}`)}
      </table>
    </div>
    <p style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0 0 12px;">To confirm your spot, send your deposit:</p>
    <div style="background: #f2f2f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
      <p style="color: #3a3a3a; font-size: 14px; margin: 0; line-height: 1.8;">${paymentInstructions}</p>
    </div>
    <p style="color: #8a8a8a; font-size: 13px; margin: 0;">Once your deposit is received you&apos;ll get a final confirmation with your calendar invite. Spots aren&apos;t held until the deposit is paid 💕</p>
  `)
}

export function bookingDeclined(clientName: string, serviceName: string, declineReason?: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Update on your request</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, we appreciate your interest in booking for ${serviceName}.</p>
    <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Unfortunately, Bri is unable to accommodate your request at this time.</p>
    ${declineReason ? `<div style="background: #f2f2f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;"><p style="color: #3a3a3a; font-size: 14px; margin: 0; line-height: 1.6;">${declineReason}</p></div>` : ''}
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">We&apos;d love to have you back — please check availability again in the future!</p>
  `)
}

export function appointmentReminder(clientName: string, serviceName: string, date: string, time: string, balanceDue: number): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">See you tomorrow! ⏰</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, just a friendly reminder about your appointment tomorrow!</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Service', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${balanceDue > 0 ? infoRow('Balance Due', `$${balanceDue.toFixed(2)}`) : infoRow('Payment', 'Fully paid ✓')}
      </table>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">Can&apos;t make it? Please contact Bri as soon as possible. We&apos;re excited to slay your look tomorrow! 💕</p>
  `)
}
