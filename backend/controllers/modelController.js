const modelService = require('../services/modelService');

const getAllModels = (req, res) => {
    const models = modelService.fetchAllModels();
    res.json(models);
};

const getModelById = (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    
    const model = modelService.fetchModelById(parseInt(id));

    if (!model) {
        return res.status(404).json({ message: "Model not found" });
    }
    res.json(model);
};

module.exports = { getAllModels, getModelById };