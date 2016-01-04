module.exports = {
    from: 'robot@example.com',
    subject: 'Your password for Notepad',
    text: 'Hello {1}. Your password was reset to {2}.', // plaintext body
    html: 'Hello <b>{1}</b>,' +
    '<br />Your password was reset to <b>{2}</b>' +
    '<br /><br />Sincerely yours, Companyname' // html body
};