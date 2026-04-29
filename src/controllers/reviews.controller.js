const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const addReview = async (req, res, next) => {
  try {
    const { place_id, trip_id, place_name, place_category, rating, facility_quality, budget_friendly, personal_experience, review_text } = req.body;
    const user_id = req.user.id;

    if (!place_id || !trip_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields: place_id, trip_id, or rating' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id,
        place_id,
        trip_id,
        place_name,
        place_category,
        rating,
        facility_quality,
        budget_friendly,
        personal_experience,
        review_text
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({ message: 'Review added successfully', review: data });
  } catch (error) {
    console.error('ADD_REVIEW_ERROR:', error);
    next(error);
  }
};

module.exports = {
  addReview
};
