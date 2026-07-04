import supabase from '../config/supabaseClient.js';

export const getCourses = async (req, res) => {
  try {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCourse = async (req, res) => {
  const { name, fee, duration } = req.body;
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ name, fee, duration }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
