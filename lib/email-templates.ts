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
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, we got your request and Bri will review it within 24 hours.</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Style', serviceName)}
        ${infoRow('Preferred Date', date)}
        ${infoRow('Preferred Time', time)}
        ${infoRow('Status', 'Pending Review')}
      </table>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">Bri will reach out once she&apos;s reviewed your request — either to approve, ask questions, or suggest an alternative time. Stay tuned! 💕</p>
  `)
}

export function quoteReady(clientName: string, serviceName: string, date: string, time: string, finalPrice: number, depositPaid: number, balanceDue: number, message: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Your quote is ready 💅</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, Bri has reviewed your request and sent you a quote!</p>
    ${message ? `<div style="border-left: 3px solid #ffabdd; padding: 12px 16px; background: #fff0f8; border-radius: 0 8px 8px 0; margin-bottom: 28px;"><p style="color: #7a2e58; font-size: 14px; font-style: italic; margin: 0;">&ldquo;${message}&rdquo;</p><p style="color: #c4658f; font-size: 12px; margin: 8px 0 0;">— Brizee Bri</p></div>` : ''}
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Style', serviceName)}
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

export function bookingConfirmed(clientName: string, serviceName: string, date: string, time: string, depositPaid: number, balanceDue: number, cancelUrl?: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">You&apos;re confirmed! 🎉</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, your appointment is officially confirmed. We can&apos;t wait to see you!</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Style', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${infoRow('Deposit Paid', `$${depositPaid.toFixed(2)}`)}
        ${balanceDue > 0 ? infoRow('Balance Due', `$${balanceDue.toFixed(2)} on appointment day`) : ''}
      </table>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">A calendar invite is attached to this email — add it to your calendar so you don&apos;t forget! 💕</p>
    <p style="color: #8a8a8a; font-size: 13px; line-height: 1.6; margin: 0;"><strong style="color: #1a1a1a;">Cancellation policy:</strong> Deposits are non-refundable. If you need to cancel, please do so as early as possible.${cancelUrl ? ` <a href="${cancelUrl}" style="color: #c4658f;">Cancel this appointment</a>` : ''}</p>
  `)
}

export function bookingAccepted(clientName: string, serviceName: string, date: string, time: string, depositAmount: number, paymentInstructions: string, cancelUrl?: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">You&apos;re approved! 🎉</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, Bri has reviewed your request and would love to have you!</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Style', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${infoRow('Deposit due', `$${depositAmount.toFixed(2)}`)}
      </table>
    </div>
    <p style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin: 0 0 12px;">To confirm your spot, send your deposit:</p>
    <div style="background: #f2f2f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
      <p style="color: #3a3a3a; font-size: 14px; margin: 0; line-height: 1.8;">${paymentInstructions}</p>
    </div>
    <p style="color: #8a8a8a; font-size: 13px; margin: 0 0 12px;">Once your deposit is received you&apos;ll get a final confirmation with your calendar invite. Spots aren&apos;t held until the deposit is paid 💕</p>
    ${cancelUrl ? `<p style="color: #b0a8a4; font-size: 12px; margin: 0;">Changed your mind? <a href="${cancelUrl}" style="color: #c4658f;">Cancel this request</a></p>` : ''}
  `)
}

export function bookingDeclined(clientName: string, serviceName: string, declineReason?: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Update on your request</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, we appreciate your interest in booking for ${serviceName}.</p>
    <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Unfortunately, Bri is unable to accommodate your request at this time.</p>
    ${declineReason ? `<div style="background: #f2f2f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;"><p style="color: #3a3a3a; font-size: 14px; margin: 0; line-height: 1.6;">${declineReason}</p></div>` : ''}
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">We&apos;d love to have you back — feel free to submit a new request when you&apos;re ready!</p>
  `)
}

export function appointmentReminder(clientName: string, serviceName: string, date: string, time: string, balanceDue: number, cancelUrl?: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">See you tomorrow! ⏰</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, just a friendly reminder about your appointment tomorrow!</p>
    <div style="background: #fff0f8; border: 1px solid #ffe0f2; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${infoRow('Style', serviceName)}
        ${infoRow('Date', date)}
        ${infoRow('Time', time)}
        ${balanceDue > 0 ? infoRow('Balance Due', `$${balanceDue.toFixed(2)} — bring cash or card`) : infoRow('Payment', 'Fully paid ✓')}
      </table>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">We&apos;re so excited to slay your look tomorrow! 💕</p>
    ${cancelUrl ? `<p style="color: #b0a8a4; font-size: 12px; margin: 0;">Need to cancel? <a href="${cancelUrl}" style="color: #c4658f;">Cancel appointment</a> — note that deposits are non-refundable.</p>` : ''}
  `)
}

export function appointmentCancelled(clientName: string, serviceName: string, date: string, cancelledBy: 'client' | 'admin' = 'client'): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">Appointment Cancelled</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, your ${serviceName} appointment has been cancelled.</p>
    <div style="background: #f2f2f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
      <p style="color: #3a3a3a; font-size: 14px; margin: 0; line-height: 1.6;">
        <strong>Service:</strong> ${serviceName}<br>
        <strong>Date:</strong> ${date}<br>
        <strong>Cancelled by:</strong> ${cancelledBy === 'client' ? 'You' : 'Bri'}
      </p>
    </div>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0 0 12px;"><strong>Deposit policy:</strong> Per our booking policy, deposits are non-refundable.</p>
    <p style="color: #3a3a3a; font-size: 14px; line-height: 1.6; margin: 0;">We hope to see you again soon! Feel free to submit a new request whenever you&apos;re ready. 💕</p>
  `)
}

export function reviewRequest(clientName: string, serviceName: string, googleReviewUrl: string): string {
  return wrapEmail(`
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a1a; margin: 0 0 8px;">How did it go? 💕</h1>
    <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 28px;">Hey ${clientName}, thank you so much for coming in for your ${serviceName}!</p>
    <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">We hope you&apos;re obsessed with your new look! If you loved your experience, leaving a quick Google review would mean the world to Bri — it helps other clients find her and supports her small business. 🌟</p>
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${googleReviewUrl}" style="display: inline-block; background: #ffabdd; color: #1a1a1a; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 50px; text-decoration: none;">Leave a Google Review ⭐</a>
    </div>
    <p style="color: #8a8a8a; font-size: 13px; text-align: center; margin: 0;">It only takes 30 seconds and makes a huge difference. Thank you! 💗</p>
  `)
}
