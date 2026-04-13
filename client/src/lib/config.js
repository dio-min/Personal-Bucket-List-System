

const API_BASE_URL = 
  import.meta.env.FRONT_URL || 
  'http://localhost:5173';     // ← This is used during local development

export default API_BASE_URL;