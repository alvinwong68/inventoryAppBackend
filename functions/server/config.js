const cors = require('cors');
const routes = require('./routes');

module.exports = (app) => {
    app.use(cors());
    routes(app);
    return app;
}