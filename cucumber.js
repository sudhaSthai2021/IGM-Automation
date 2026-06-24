module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'features/step-definitions/**/*.ts',
      'support/**/*.ts'
    ],
    format: ['progress'],
    publishQuiet: true
  }
};