const Category = require('../models/Category')

exports.list = async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 })
  res.json({
    total: categories.length,
    items: categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
    })),
  })
}
