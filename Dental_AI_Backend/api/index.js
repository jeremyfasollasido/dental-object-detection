export default (req, res) => {
  console.log('Function called with path:', req.url);
  res.status(200).json({ message: 'Hello from Vercel!' });
};  