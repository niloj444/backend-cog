export const authenticatedTest = (req, res) => res.status(200).json({ success: true, message: 'Authenticated access granted', role: req.user.role });
export const adminTest = (req, res) => res.status(200).json({ success: true, message: 'Administrator access granted' });
export const clinicalTest = (req, res) => res.status(200).json({ success: true, message: 'Clinical role access granted' });
