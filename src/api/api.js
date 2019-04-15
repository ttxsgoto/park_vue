const api01 = {
    login01: {
        url: '/auth_ttxs/jwt/login/',
        method: 'post',
        notNeedToken: true,
        desc: '登录',
        param: {
            username: {
                desc: '用户名',
            },
            password: {
                desc: '密码',
            }
        }
    },
};

export default api01
