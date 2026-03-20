const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Snippet = require('../models/Snippet');
const { generateEmbedding } = require('../utils/local');
const { generateExplanation } = require('../utils/groq');

router.get('/:id/explain', auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ msg: 'Snippet not found' });
    if (snippet.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const explanation = await generateExplanation(snippet.code, snippet.language);
    res.json({ explanation });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

router.get('/semantic-search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ msg: 'Query is required' });

    const queryEmbedding = await generateEmbedding(query);

    const snippets = await Snippet.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
          filter: { user: new mongoose.Types.ObjectId(req.user.id) }
        }
      },
      {
        $set: { score: { $meta: "vectorSearchScore" } }
      },
      {
        $match: { score: { $gt: 0.60 } }
      }
    ]);

    res.json(snippets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, language, code, tags, isFavorite } = req.body;

    const textToEmbed = `${title} ${description || ''} ${language} ${tags ? tags.join(' ') : ''} ${code}`;
    const embedding = await generateEmbedding(textToEmbed);

    const newSnippet = new Snippet({
      title,
      description,
      language,
      code,
      tags,
      isFavorite,
      embedding,
      user: req.user.id
    });
    const snippet = await newSnippet.save();
    res.json(snippet);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, language, code, tags, isFavorite } = req.body;

    let snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ msg: 'Snippet not found' });

    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    snippet.title = title || snippet.title;
    snippet.description = description !== undefined ? description : snippet.description;
    snippet.language = language || snippet.language;
    snippet.code = code || snippet.code;
    snippet.isFavorite = isFavorite !== undefined ? isFavorite : snippet.isFavorite;

    snippet.tags = tags || snippet.tags;

    if (title || description !== undefined || language || code || tags) {
      const textToEmbed = `${snippet.title} ${snippet.description || ''} ${snippet.language} ${snippet.tags ? snippet.tags.join(' ') : ''} ${snippet.code}`;
      snippet.embedding = await generateEmbedding(textToEmbed);
    }

    await snippet.save();
    res.json(snippet);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    let snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ msg: 'Snippet not found' });

    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Snippet removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

module.exports = router;
