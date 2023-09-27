const randomString=() => {

    const chars = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ0123456789';

    let result = '';

    for (let i = 7; i > 0; i--) {

        result += chars[Math.round(Math.random() * (chars.length - 1))];

    }

    return result;

}

module.exports = {randomString}