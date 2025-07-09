const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('Env file path:', path.join(__dirname, '.env'));
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Defined' : 'Undefined');
console.log('All env variables:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('PORT') || key.includes('JWT') || key.includes('CLOUDINARY')));