import { Paper } from '../models/Paper.js';

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords.map((item) => String(item).trim()).filter(Boolean);
  if (typeof keywords === 'string') return keywords.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function createPaper(req, res) {
  const { title, doi, paperLink, abstract, keywords, publishedYear } = req.body;

  if (!title || !doi || !paperLink || !abstract || !publishedYear) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const duplicate = await Paper.findOne({ $or: [{ doi }, { paperLink }] });
  if (duplicate) {
    return res.status(409).json({
      message: 'A paper with this DOI or link already exists',
      duplicatePaperId: duplicate._id,
    });
  }

  const paper = await Paper.create({
    title,
    doi,
    paperLink,
    abstract,
    keywords: normalizeKeywords(keywords),
    publishedYear,
    requestedBy: req.user._id,
  });

  res.status(201).json({ paper });
}

export async function getMyPapers(req, res) {
  const papers = await Paper.find({ requestedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ papers });
}

export async function getAllPapers(req, res) {
  const { status, search } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { doi: { $regex: search, $options: 'i' } },
      { paperLink: { $regex: search, $options: 'i' } },
    ];
  }

  const papers = await Paper.find(filter)
    .populate('requestedBy', 'fullName email university studentId')
    .populate('uploadedBy', 'fullName email')
    .sort({ createdAt: -1 });

  res.json({ papers });
}

export async function getPaperById(req, res) {
  const paper = await Paper.findById(req.params.id)
    .populate('requestedBy', 'fullName email university studentId')
    .populate('uploadedBy', 'fullName email');

  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  if (req.user.role !== 'admin' && paper.requestedBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You do not have permission to view this paper' });
  }

  res.json({ paper });
}

export async function updatePaperStatus(req, res) {
  const { status } = req.body;
  const allowedStatuses = ['not_downloaded', 'downloaded', 'duplicate', 'need_info', 'failed'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const paper = await Paper.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  res.json({ paper });
}

export async function uploadPaperPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'PDF file is required' });
  }

  const paper = await Paper.findByIdAndUpdate(
    req.params.id,
    {
      pdfPath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      status: 'downloaded',
    },
    { new: true }
  );

  if (!paper) return res.status(404).json({ message: 'Paper not found' });

  res.json({ paper });
}
