const express = require('express');
const bodyParser = require('body-parser');
const next = require('next');
const nextI18NextMiddleware = require('next-i18next/middleware').default;
const nextI18next = require('./i18n');
const path = require('path');
const useragent = require('express-useragent');
const frameguard = require('frameguard');

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = NODE_ENV === 'development';
const API_ENDPOINT = process.env.ENDPOINT || 'http://local2.playentry.org/graphql';
const SERVER_DOMAIN = process.env.SERVER_DOMAIN || 'http://local2.playentry.org';
const SERVER_PORT = process.env.PORT || 3101;

//naver
const passport = require('passport');
const NaverStrategy = require('passport-naver').Strategy;
const session = require('express-session');
//key
const client_id = 'RmIfrxVx6Dg44U7YKze5';
const client_secret = '8abcnAqsU9';
const callback_url = 'http://local2.playentry.org/auth/naver/callback';

passport.serializeUser((user, done) => {
    // console.log('serializeUser');
    // console.log(user);
    done(null, user);
});

// passport로 로그인 처리 후 해당 정보를 session에 담는다.
passport.deserializeUser((req, user, done) => {
    console.log('deserializeUser');
    req.session.sid = user.name;
    console.log('session Check :' + req.session.sid);

    done(null, user);
});

passport.use(
    new NaverStrategy(
        {
            clientID: client_id,
            clientSecret: client_secret,
            callbackURL: callback_url,
        },
        (accessToken, refreshToken, profile, done) => {
            const _profile = profile._json;
            // console.log(_profile);
            process.nextTick(() => {
                //_profile = { email: 'lee21137@nate.com',
                //   nickname: '이승민',
                //   profile_image: undefined,
                //   age: undefined,
                //   birthday: undefined,
                // }

                //변수 user 명을 같게 할것
                const user = {
                    auth_type: 'naver',
                    auth_id: _profile.id,
                    auth_name: _profile.nickname,
                    auth_email: _profile.email,
                };
                //검증로직.
                loginByThirdparty(user, done);
                // return done(null, user);
            });
        }
    )
);

//loginByThirdparty -> serializeUser
function loginByThirdparty(user, done) {
    console.log('load user');
    return done(null, {
        userId: user.id,
        nickname: user.nickname,
    });
}

const app = next({
    dev: IS_DEVELOPMENT,
    quiet: !IS_DEVELOPMENT,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Naver
    // server.use(session({ secret: 'keyboard cat' }));
    server.use(passport.initialize());
    server.use(passport.session());

    server.use(nextI18NextMiddleware(nextI18next));
    server.use(useragent.express());
    server.use(bodyParser.text());
    server.get('/monitor/l7check', (req, res) => {
        res.send('OK');
    });

    server.use('/lib', express.static(path.join(__dirname, 'static', 'lib')));
    server.use('/img', express.static(path.join(__dirname, 'static', 'img')));
    server.use('/js', express.static(path.join(__dirname, 'static', 'js')));
    server.use('/media', express.static(path.join(__dirname, 'static', 'media')));

    server.use(
        frameguard({
            action: 'allow-from',
            domain: SERVER_DOMAIN,
        })
    );

    server.use('/pdfjs', express.static(path.join(__dirname, 'lib', 'pdfjs')));

    // login btn -> naver
    server.use('/auth/login/naver', passport.authenticate('naver'));
    // callback 처리 부분 성공/실패 시 리다이렉트 설정
    server.use(
        '/auth/naver/callback',
        passport.authenticate('naver', {
            failureRedirect: '/neoid/fail',
        }),
        (req, res) => {
            // console.log(req.query);
            res.query = req.query;
            res.redirect(`/neoid/ok?code=${req.query.code}`);
        }
    );

    server.get('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(SERVER_PORT, (err) => {
        if (err) {
            throw err;
        }
        console.log(`Server started on port ${SERVER_PORT} ${NODE_ENV} mode (${API_ENDPOINT})`);
    });
});
