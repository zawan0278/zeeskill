// Default policy drafts. Tokens {{brand}} {{email}} {{phone}} {{addr}} {{commission}} are filled automatically.
// Editable later in Admin > Website content > legalDocs. Have a lawyer review before launch.
export const fill=(t,C)=>t.replaceAll('{{brand}}',C.brand).replaceAll('{{email}}',C.email).replaceAll('{{phone}}',C.phone).replaceAll('{{addr}}',C.addr)
 .replaceAll('{{commission}}',C.plans.map(p=>`- ${p.n} plan (PKR ${p.p.toLocaleString('en-PK')}): Level 1 ${p.l1}%, Level 2 ${p.l2}%`).join('\n'));

export const legalDocs={
privacy:`Last updated: October 2026

## 1. Who we are
{{brand}} ("we", "us") runs an online learning and partner platform for users in Pakistan. Contact: {{email}}, {{phone}}, {{addr}}.

## 2. Information we collect
- Account details: name, email, phone number, password (stored securely, never visible to us).
- Payment details you submit: payment method and transaction ID. We never ask for your card PIN or online banking password.
- Learning activity: courses opened, lessons completed, certificates issued.
- Referral activity: who joined with your referral code, and commissions earned.
- Messages you send through our contact or newsletter forms.

## 3. How we use it
We use your information to create and secure your account, verify payments, give access to courses, calculate and pay commissions, issue certificates, answer your questions, and improve the platform. We may send service messages about your account.

## 4. Sharing
We do not sell your personal data. We share it only with service providers who run the platform for us (for example hosting and database providers), with payment channels when needed to complete a payment or withdrawal, and with authorities when the law requires it. If you refer someone, you can see their name and plan status, but not their contact details.

## 5. Storage and security
Data is stored with reputable cloud providers and protected by access controls. No system is 100% secure, so please use a strong password and never share it.

## 6. Cookies and local storage
We use your browser storage to keep you logged in and remember your theme (light or dark). We do not use advertising trackers.

## 7. Your choices
You may ask us at {{email}} to view, correct or delete your data. Some records (payments, commissions) may be kept as long as needed for accounting and legal reasons.

## 8. Children
Our services are for users aged 18 and over. Younger users need a parent or guardian to register and supervise.

## 9. Changes
We may update this policy. The date at the top shows the latest version.`,

terms:`Last updated: October 2026

## 1. Acceptance
By creating an account or using {{brand}} you agree to these Terms, our Privacy Policy, Refund Policy, Disclaimer and Commission Plan. If you do not agree, please do not use the platform.

## 2. Eligibility and account
You must be 18 or older (or have a guardian's consent). Provide correct information and keep your password private. You are responsible for activity under your account. One person, one account.

## 3. Plans and payments
Access to courses depends on the plan you buy. Fees are shown in PKR and are one-time unless stated otherwise. Pay only to the official accounts shown on this website. Your plan is activated after we verify your payment, which may take some time.

## 4. Personal use of content
Courses, videos, notes and certificates are for your personal learning. You must not share your login, resell, copy, record, upload or distribute our content.

## 5. Partner (refer and earn) program
You may share your referral link honestly. Commissions follow the Commission Plan. You must not spam, make false income promises, use misleading ads, or refer yourself or fake accounts.

## 6. Prohibited conduct
Do not misuse the platform, attempt to hack it, upload harmful content, harass others, or break any law, including Pakistan's Prevention of Electronic Crimes Act.

## 7. Intellectual property
All content, logos and materials belong to {{brand}} or its licensors. You receive a limited, non-transferable right to access them while your account is active.

## 8. Suspension and termination
We may suspend or close accounts that break these Terms, commit fraud, or abuse the partner program. Unpaid commissions on fraudulent activity may be cancelled.

## 9. No guarantee and limitation of liability
We provide education and tools, not guaranteed results or income. To the extent allowed by law, we are not liable for indirect or consequential losses. Our total liability is limited to the fee you paid for your plan.

## 10. Governing law
These Terms are governed by the laws of Pakistan. Disputes are subject to the courts of Islamabad, after we have first tried to resolve them in good faith.

## 11. Changes and contact
We may update these Terms; continued use means you accept the changes. Questions: {{email}}.`,

eua:`Last updated: October 2026

This End User Agreement explains how you may use {{brand}} as a learner and as a partner.

## 1. License
We give you a personal, non-exclusive, non-transferable license to watch lessons, read materials and use your dashboard while your account is active.

## 2. What you agree not to do
- Share, sell or rent your account or course access to anyone else.
- Download, record, copy or re-upload videos and materials.
- Use bots or tools to bypass restrictions or access locked courses.
- Create multiple accounts to earn commissions or bypass rules.

## 3. Certificates
A certificate is issued only after you complete all lessons of a course. Each certificate has a code that anyone can verify on our website. Misuse or forgery will lead to cancellation and possible legal action.

## 4. Partner conduct
When promoting {{brand}} you must describe it honestly, state that income depends on real sales and effort, and follow our Terms and Commission Plan.

## 5. Updates
Courses may be improved, reordered or replaced over time. We try to keep your access to purchased content for the duration of your plan.

## 6. Contact
{{email}} | {{phone}}`,

refund:`Last updated: October 2026

We want you to be happy with your purchase. Please read this policy before paying.

## 1. Refund window
You can request a refund within 7 days of your plan activation, if you have completed less than 20% of the lessons in your plan and have not received a certificate.

## 2. When refunds are not available
- After 7 days from activation.
- After 20% or more of the lessons are completed, or a certificate has been issued.
- If your account was suspended for breaking our Terms.
- For plan upgrades, only the upgrade amount is considered, under the same conditions.

## 3. How to request
Email {{email}} from your registered email with your name, phone number and transaction ID. We will review and reply within 3 working days.

## 4. Payout
Approved refunds are sent to the same JazzCash, Easypaisa or bank account you paid from, within 7 to 10 working days. Transfer charges, if any, may be deducted.

## 5. Effect on commissions
If a purchase is refunded, any commission earned from that purchase is reversed from the referrer's balance. If the balance is not enough, the difference is adjusted against future commissions.

## 6. Duplicate or wrong payments
If you paid twice or paid the wrong amount, contact us with the transaction IDs and we will correct it.`,

disclaimer:`Last updated: October 2026

## Educational purpose
{{brand}} provides skill-based learning. Our courses teach methods and tools; they do not promise jobs, clients or a specific income.

## No income guarantee
Any earnings, examples or success stories shown are illustrative or individual cases. Results depend on your effort, skills, market conditions and time. You should not expect to earn a particular amount.

## Partner program
Commissions are paid only from real, verified plan purchases made through your referral code. There is no income from recruitment alone. Please promote honestly and never promise guaranteed profit to anyone.

## Third-party platforms
Names such as Fiverr, Upwork, YouTube, JazzCash and Easypaisa belong to their owners. {{brand}} is not affiliated with or endorsed by them. Their rules and fees can change at any time.

## Information accuracy
We work to keep content accurate and current, but we do not guarantee that it is free from errors or suits every situation. This is not legal, financial or tax advice.

## Payments
Pay only to the official accounts published on this website. We are not responsible for money sent to personal numbers, agents or accounts not shown on our website.

## Contact
{{email}} | {{phone}}`,

commission:`Last updated: October 2026

This plan explains how partners earn on {{brand}}.

## 1. Commission rates
Rates depend on the partner's own active plan. When a person you referred buys a plan and the payment is verified, you earn a percentage of that plan's price:
{{commission}}

## 2. Levels
- Level 1: people who register with your referral code.
- Level 2: people referred by your Level 1 partners.

## 3. When commission is credited
Commission is credited to your dashboard balance after we verify the referred person's payment. You must hold an active plan to earn commission.

## 4. Withdrawals
- Minimum withdrawal: PKR 500. Maximum: PKR 50,000 per request.
- Methods: JazzCash, SadaPay, Easypaisa or bank transfer.
- Requests are processed manually, usually within 3 working days.
- If a withdrawal is rejected, the amount returns to your balance.

## 5. Not eligible
- Self-referrals, fake or duplicate accounts.
- Purchases that are refunded or reversed (commission is cancelled).
- Sales made by spam, misleading ads or false income promises.

## 6. Fraud and changes
If we find fraud or abuse, we may cancel commissions, suspend the account and take legal action. We may update rates for future sales; we will publish changes on this page. Rates apply for the plan price at the time of purchase.

## 7. Important
Commission comes only from real course sales. Earnings are not guaranteed and depend on your effort.`};
