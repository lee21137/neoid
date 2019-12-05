import React, { Component } from 'react';
import { withTranslation } from '@i18n';
import axios from 'axios';
import passport from 'passport';

class Get extends Component {
    constructor(props) {
        super(props);

        const { t } = props;
        this.state = {
            serviceId: 'serviceId',
            serviceKey: 'serviceKey',
            consumer: 'consumer',
            token: `token/token+o/OhUsvY3Aa6YC5+bCz53/A1oGAdRf8kO3h5yKooaJDwTsojEGXTOIVpE6HGcEGNi+aEIHntIDL5ZvFXkOug/Z95La+MA8+Cr23mqse2f7vVhnfhuqG6YonblIBPdfjIiwENbPjn1pSYpQX2Q2lsGjrECMxZXA6BWvzOTnmR58xfD7rk4/dy6W2Vj+mMToCScao6WE5i`,
        };
        //도메인 체크
        const successUrl = encodeURI('http://local.playsw.or.kr/neoid/ok');
        const neoIdUrl =
            'https://dev-apis.neoid.naver.com/v1/private/playsoftware/iasystem/authurl?authType=PC_SELF_AUTH&rurl=http://local.playsw.or.kr/main';
        //`https://dev-apis.neoid.naver.com/v1/users/iasystem/authurl?authType=PC_SELF_AUTH&rurl=${successUrl}`;
        axios({
            url: neoIdUrl,
            responseType: 'json',
            timeout: 1000,
            headers: {
                'X-NEOID-service-id': this.state.serviceId,
                'X-NEOID-service-key': this.state.serviceKey,
                'X-NEOID-consumer-key': this.state.consumer,
                'X-NEOID-access-token': this.state.token,
            },
        })
            .then((res) => {
                console.log(res.data);

                this.setState({
                    auth_url: res.data.rtn_data.auth_url,
                });
            })
            .catch((e) => {
                return '1';
            });
    }

    static async getInitialProps() {
        return {
            namespacesRequired: ['common'],
        };
    }

    authPop() {
        const width = 420;
        const height = 150;
        const screenW = screen.availWidth;
        const screenH = screen.availHeight;
        const left = (screenW - width) / 2;
        const top = (screenH - height) / 2;
        const settings = `width=${width}, height=${height}, top=${top}, left=${left}`;

        const checkPopup = window.open(`${this.state.auth_url}`, 'popup_safari_hw', `${settings}`);
    }

    //authType : PC_INFO_AGREE_PRTS_AUTH, MOBILE_INFO_AGREE_PRTS_AUTH
    authParentPop() {
        const successUrl = encodeURI('http://local.playsw.or.kr/neoid/ok');

        const width = 420;
        const height = 150;
        const screenW = screen.availWidth;
        const screenH = screen.availHeight;
        const left = (screenW - width) / 2;
        const top = (screenH - height) / 2;
        const settings = `width=${width}, height=${height}, top=${top}, left=${left}`;

        const neoIdUrl = `https://dev-apis.neoid.naver.com/v1/users/iasystem/authurl?authType=PC_INFO_AGREE_PRTS_AUTH&rurl=${successUrl}`;
        axios({
            url: neoIdUrl,
            responseType: 'json',
            timeout: 1000,
            headers: {
                'X-NEOID-service-id': this.state.serviceId,
                'X-NEOID-service-key': this.state.serviceKey,
                'X-NEOID-consumer-key': this.state.consumer,
                'X-NEOID-access-token': this.state.token,
            },
        })
            .then((res) => {
                window.open(res.data.rtn_data.auth_url, 'popup_safari_hw', `${settings}`);
            })
            .catch((e) => {
                return '1';
            });
    }

    // https://dev-apis.neoid.naver.com/v1/users/5b2a66c0-0578-11e8-8f8e-00000000ce88/profile
    authinfo() {
        const userNeoId = '5b2a66c0-0578-11e8-8f8e-00000000ce88'; //'5b2a66c0-0578-11e8-8f8e-00000000ce88';
        const neoIdUrl = `https://dev-apis.neoid.naver.com/v1/users/${userNeoId}/profile`;

        axios({
            url: neoIdUrl,
            responseType: 'json',
            timeout: 1000,
            headers: {
                'X-NEOID-service-id': this.state.serviceId,
                'X-NEOID-service-key': this.state.serviceKey,
                'X-NEOID-consumer-key': this.state.consumer,
                'X-NEOID-access-token': this.state.token,
            },
        })
            .then((res) => {
                //console.log(res);
                this.setState({
                    userinfo: res.data.rtn_data,
                });
            })
            .catch((e) => {
                return '1';
            });
    }

    snslogin(snsCd) {
        const successUrl = encodeURI('https://local.playsw.or.kr/neoid/ok');
        const serverDomain = 'beta.playsw.or.kr';
        const url = `http://${serverDomain}/neoid/snsLoginBegin?snsCode=${snsCd}&returnUrl=${successUrl}&sd=${serverDomain}`;

        const width = 420;
        const height = 150;
        const screenW = screen.availWidth;
        const screenH = screen.availHeight;
        const left = (screenW - width) / 2;
        const top = (screenH - height) / 2;
        const settings = `width=${width}, height=${height}, top=${top}, left=${left}`;

        window.open(url, '_snsLoginWindow', settings);
    }

    render() {
        console.log('q');
        return (
            <React.Fragment>
                <div>
                    <React.Fragment>
                        {this.state.auth_url && (
                            <p>
                                <span onClick={(e) => this.authPop()}>본인 휴대전화 인증</span>/
                                <span onClick={(e) => this.authParentPop()}>
                                    보호자 동의 확인(부모)
                                </span>
                            </p>
                        )}
                        <p onClick={(e) => this.authinfo()}>정보보기</p>
                        {this.state.userinfo && (
                            <p>
                                INFO_AGREE_PRTS_AUTH_DT:{' '}
                                {this.state.userinfo.INFO_AGREE_PRTS_AUTH_DT}
                                <br />
                                INFO_AGREE_PRTS_MOBILE: {this.state.userinfo.INFO_AGREE_PRTS_MOBILE}
                                <br />
                                DI: {this.state.userinfo.DI}
                                <br />
                                INFO_AGREE_PRTS_SEX: {this.state.userinfo.INFO_AGREE_PRTS_SEX}
                                <br />
                                INFO_AGREE_PRTS_NAME: {this.state.userinfo.INFO_AGREE_PRTS_NAME}
                                <br />
                                NAME: {this.state.userinfo.NAME}
                                <br />
                            </p>
                        )}

                        <p>
                            <a
                                href="/auth/login/naver"
                                class="btn btn-block btn-lg btn-success btn_login"
                            >
                                [NAVER]
                            </a>
                        </p>
                    </React.Fragment>
                </div>
            </React.Fragment>
        );
    }
}

export default withTranslation('common')(Get);
