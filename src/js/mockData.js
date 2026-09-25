export const mockHistory = [
  {
    id: 1,
    message: "URGENT: Your account has been suspended. Click here to verify your details: http://secure-update-account.com",
    score: 95,
    status: "Dangerous",
    date: "2023-10-24T10:30:00Z",
    redFlags: [
      "Creates urgency to make you act fast",
      "Contains a suspicious link",
      "Asks for account verification"
    ],
    explanation: "This message uses a classic phishing tactic by creating a false sense of urgency. The link provided does not match the official website of any known service provider, and it's attempting to steal your login credentials."
  },
  {
    id: 2,
    message: "Hey, are we still on for lunch tomorrow at 12?",
    score: 5,
    status: "Safe",
    date: "2023-10-23T14:15:00Z",
    redFlags: [],
    explanation: "This appears to be a normal conversational message with no suspicious links, requests for money, or urgent demands."
  },
  {
    id: 3,
    message: "Congratulations! You've won a $1,000 Walmart gift card. Reply with your name and address to claim your prize.",
    score: 82,
    status: "Suspicious",
    date: "2023-10-22T09:00:00Z",
    redFlags: [
      "Too good to be true offer",
      "Asks for personal information",
      "Unsolicited prize notification"
    ],
    explanation: "Scammers often use fake prizes to trick people into providing personal information. Legitimate companies do not ask for your address via unsolicited text messages to claim a prize you never entered for."
  },
  {
    id: 4,
    message: "Hi mom, I broke my phone and this is my new number. Can you WhatsApp me? I need some money for a new phone.",
    score: 75,
    status: "Suspicious",
    date: "2023-10-21T18:45:00Z",
    redFlags: [
      "Claims to be a family member in distress",
      "Asks for money to be sent",
      "Uses an unknown number"
    ],
    explanation: "This is a common 'Hi Mom/Dad' scam. The sender pretends to be a family member who lost their phone and urgently needs money. Always verify their identity by calling their original number before sending any money."
  },
  {
    id: 5,
    message: "Your package delivery failed due to unpaid customs fees. Pay $2.99 here: http://post-delivery-fees.com/track",
    score: 88,
    status: "Dangerous",
    date: "2023-10-20T11:20:00Z",
    redFlags: [
      "Fake delivery notification",
      "Small payment requested to steal credit card details",
      "Suspicious tracking link"
    ],
    explanation: "Scammers send fake delivery alerts requiring a small fee. Their goal is not the $2.99, but to steal the credit card information you enter on their fake website."
  }
];

export const mockStats = {
  totalChecked: 1248,
  flaggedRisky: 42,
  mostCommonFlag: "Suspicious links",
  trendData: [
    { day: "Mon", riskScore: 12 },
    { day: "Tue", riskScore: 18 },
    { day: "Wed", riskScore: 15 },
    { day: "Thu", riskScore: 45 },
    { day: "Fri", riskScore: 30 },
    { day: "Sat", riskScore: 22 },
    { day: "Sun", riskScore: 28 },
  ]
};
