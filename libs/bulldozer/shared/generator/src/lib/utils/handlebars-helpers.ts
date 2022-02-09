/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Handlebars from 'handlebars';

export const registerHandleBarsHelpers = () => {
  Handlebars.registerHelper('switch', function (this: any, value, options) {
    this.switch_value = value;
    return options.fn(this);
  });

  Handlebars.registerHelper('case', function (this: any, value, options) {
    if (value == this.switch_value) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('eq', function (this: any, a, b, options) {
    if (a == b) {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('gt', function (this: any, a, b, options) {
    if (a > b) {
      return options.fn(this);
    }
  });
};
