// https://eth-ropsten.alchemyapi.io/v2/fT-QqxeEoY2Mf8hzKANOHyVNMrnuoKcs
// f4faa6bb445484662e5600013321492dfa56af4b63fd971d2caa43e98c6f185f

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/z4WpA8UKgqnwbTYmrZu15yCOiijBKaRv',
      accounts: ['f4faa6bb445484662e5600013321492dfa56af4b63fd971d2caa43e98c6f185f'],
    },
  },
};