const Service = require('../models/Service');

const buildUploadedFilePath = (file) => {
  if (!file) {
    return undefined;
  }

  return `/uploads/services/${file.filename}`;
};

const parseFeatures = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((feature) => String(feature).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((feature) => String(feature).trim()).filter(Boolean);
    }
  } catch (error) {
    // Fallback to comma-separated input.
  }

  return String(value)
    .split(',')
    .map((feature) => feature.trim())
    .filter(Boolean);
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ message: 'Titre, description et prix sont requis' });
    }

    const service = await Service.create({
      title,
      description,
      price: Number(price),
      features: parseFeatures(req.body.features),
      image: buildUploadedFilePath(req.file),
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }

    if (req.body.title !== undefined) {
      service.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      service.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      service.price = Number(req.body.price);
    }

    if (req.body.features !== undefined) {
      service.features = parseFeatures(req.body.features);
    }

    if (req.file) {
      service.image = buildUploadedFilePath(req.file);
    }

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }

    await service.deleteOne();
    res.json({ message: 'Service supprime avec succes' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
