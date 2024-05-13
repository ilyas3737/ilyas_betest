const jwt = require('jsonwebtoken'),
        express = require('express'),
        path = require('path'),
        bodyParser = require('body-parser'),
        dotenv = require('dotenv'),
        cors = require('cors'),
        fileUpload = require('express-fileupload'),
        swaggerJsdoc = require("swagger-jsdoc"),
        { MongoClient } = require('mongodb'),
        swaggerUi = require("swagger-ui-express");

dotenv.config();

const PORT = process.env.PORT;

const app = express();


app.use(cors({ credentials: true, origin: '*' }));
app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({createParentPath: true}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

if(process.env.ISDEV=="true"){
    const swaggerDefinition = {
        info: {
        title: 'MS Ilyas Betest',
        version: '1.0.0',
        description: 'API documentation with Swagger',
        },
        host: `localhost:${PORT}`,
        basePath: '/',
        servers: [
            {
              url: 'http://localhost:3000',
              description: 'Local server',
            },
          ],
          components: {
            schemas: {},
          },
    };

    const options = {
        swaggerDefinition,
        apis: ['./routes/*.js'],
    };
    const specs = swaggerJsdoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

const userRoutes = require('./routes/ApiRoutes');
app.use("/", userRoutes);
app.use("/", (req, res)=>{
    res.redirect("/api-docs")
})

if(process.env.TEST !== "true"){
    app.listen(PORT, async (error) => {
        if (!error) {
            console.log("server running || port : " + process.env.PORT);
        } else {
            console.log("Error occurred, server can't start", error);
        }
    });
}
module.exports = app;