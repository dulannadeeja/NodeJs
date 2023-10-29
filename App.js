const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./Routes/Admin').router;
const shopRoutes = require('./Routes/Shop');

const rootDir = require('./Utils/Path');

app.set('view engine', 'pug');
app.set('views', 'Views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'Public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        path: '/404'
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

