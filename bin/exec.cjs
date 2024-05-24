#!/usr/bin/env node
'use strict';

var require$$0 = require('events');
var require$$1 = require('child_process');
var path$1 = require('path');
var fs$1 = require('fs');
var require$$4 = require('process');
var url = require('url');
var require$$0$1 = require('os');
var require$$1$1 = require('tty');
var require$$4$1 = require('crypto');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path$1);
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs$1);

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var commander$1 = {exports: {}};

var argument = {};

var error = {};

/**
 * CommanderError class
 * @class
 */

let CommanderError$2 = class CommanderError extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @constructor
   */
  constructor(exitCode, code, message) {
    super(message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
};

/**
 * InvalidArgumentError class
 * @class
 */
let InvalidArgumentError$3 = class InvalidArgumentError extends CommanderError$2 {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   * @constructor
   */
  constructor(message) {
    super(1, 'commander.invalidArgument', message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
};

error.CommanderError = CommanderError$2;
error.InvalidArgumentError = InvalidArgumentError$3;

const { InvalidArgumentError: InvalidArgumentError$2 } = error;

let Argument$2 = class Argument {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */

  constructor(name, description) {
    this.description = description || '';
    this.variadic = false;
    this.parseArg = undefined;
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.argChoices = undefined;

    switch (name[0]) {
      case '<': // e.g. <required>
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case '[': // e.g. [optional]
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }

  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name;
  }

  /**
   * @api private
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError$2(`Allowed choices are ${this.argChoices.join(', ')}.`);
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Make argument required.
   */
  argRequired() {
    this.required = true;
    return this;
  }

  /**
   * Make argument optional.
   */
  argOptional() {
    this.required = false;
    return this;
  }
};

/**
 * Takes an argument and returns its human readable equivalent for help usage.
 *
 * @param {Argument} arg
 * @return {string}
 * @api private
 */

function humanReadableArgName$2(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']';
}

argument.Argument = Argument$2;
argument.humanReadableArgName = humanReadableArgName$2;

var command = {};

var help = {};

const { humanReadableArgName: humanReadableArgName$1 } = argument;

/**
 * TypeScript import types for JSDoc, used by Visual Studio Code IntelliSense and `npm run typescript-checkJS`
 * https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types
 * @typedef { import("./argument.js").Argument } Argument
 * @typedef { import("./command.js").Command } Command
 * @typedef { import("./option.js").Option } Option
 */

// Although this is a class, methods are static in style to allow override using subclass or just functions.
let Help$2 = class Help {
  constructor() {
    this.helpWidth = undefined;
    this.sortSubcommands = false;
    this.sortOptions = false;
    this.showGlobalOptions = false;
  }

  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */

  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter(cmd => !cmd._hidden);
    if (cmd._hasImplicitHelpCommand()) {
      // Create a command matching the implicit help command.
      const [, helpName, helpArgs] = cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
      const helpCommand = cmd.createCommand(helpName)
        .helpOption(false);
      helpCommand.description(cmd._helpCommandDescription);
      if (helpArgs) helpCommand.arguments(helpArgs);
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        // @ts-ignore: overloaded return type
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }

  /**
   * Compare options for sort.
   *
   * @param {Option} a
   * @param {Option} b
   * @returns number
   */
  compareOptions(a, b) {
    const getSortKey = (option) => {
      // WYSIWYG for order displayed in help. Short used for comparison if present. No special handling for negated.
      return option.short ? option.short.replace(/^-/, '') : option.long.replace(/^--/, '');
    };
    return getSortKey(a).localeCompare(getSortKey(b));
  }

  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);
    // Implicit help
    const showShortHelpFlag = cmd._hasHelpOption && cmd._helpShortFlag && !cmd._findOption(cmd._helpShortFlag);
    const showLongHelpFlag = cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
    if (showShortHelpFlag || showLongHelpFlag) {
      let helpOption;
      if (!showShortHelpFlag) {
        helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
      } else if (!showLongHelpFlag) {
        helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
      } else {
        helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
      }
      visibleOptions.push(helpOption);
    }
    if (this.sortOptions) {
      visibleOptions.sort(this.compareOptions);
    }
    return visibleOptions;
  }

  /**
   * Get an array of the visible global options. (Not including help.)
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleGlobalOptions(cmd) {
    if (!this.showGlobalOptions) return [];

    const globalOptions = [];
    for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
      globalOptions.push(...visibleOptions);
    }
    if (this.sortOptions) {
      globalOptions.sort(this.compareOptions);
    }
    return globalOptions;
  }

  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */

  visibleArguments(cmd) {
    // Side effect! Apply the legacy descriptions before the arguments are displayed.
    if (cmd._argsDescription) {
      cmd.registeredArguments.forEach(argument => {
        argument.description = argument.description || cmd._argsDescription[argument.name()] || '';
      });
    }

    // If there are any arguments with a description then return all the arguments.
    if (cmd.registeredArguments.find(argument => argument.description)) {
      return cmd.registeredArguments;
    }
    return [];
  }

  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandTerm(cmd) {
    // Legacy. Ignores custom usage string, and nested commands.
    const args = cmd.registeredArguments.map(arg => humanReadableArgName$1(arg)).join(' ');
    return cmd._name +
      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
      (cmd.options.length ? ' [options]' : '') + // simplistic check for non-help option
      (args ? ' ' + args : '');
  }

  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */

  optionTerm(option) {
    return option.flags;
  }

  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */

  argumentTerm(argument) {
    return argument.name();
  }

  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(max, helper.subcommandTerm(command).length);
    }, 0);
  }

  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  /**
   * Get the longest global option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestGlobalOptionTermLength(cmd, helper) {
    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(max, helper.argumentTerm(argument).length);
    }, 0);
  }

  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandUsage(cmd) {
    // Usage
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + '|' + cmd._aliases[0];
    }
    let ancestorCmdNames = '';
    for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      ancestorCmdNames = ancestorCmd.name() + ' ' + ancestorCmdNames;
    }
    return ancestorCmdNames + cmdName + ' ' + cmd.usage();
  }

  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandDescription(cmd) {
    // @ts-ignore: overloaded return type
    return cmd.description();
  }

  /**
   * Get the subcommand summary to show in the list of subcommands.
   * (Fallback to description for backwards compatibility.)
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandDescription(cmd) {
    // @ts-ignore: overloaded return type
    return cmd.summary() || cmd.description();
  }

  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */

  optionDescription(option) {
    const extraInfo = [];

    if (option.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`);
    }
    if (option.defaultValue !== undefined) {
      // default for boolean and negated more for programmer than end user,
      // but show true/false for boolean option as may be for hand-rolled env or config processing.
      const showDefault = option.required || option.optional ||
        (option.isBoolean() && typeof option.defaultValue === 'boolean');
      if (showDefault) {
        extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
      }
    }
    // preset for boolean and negated are more for programmer than end user
    if (option.presetArg !== undefined && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      return `${option.description} (${extraInfo.join(', ')})`;
    }

    return option.description;
  }

  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */

  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`);
    }
    if (argument.defaultValue !== undefined) {
      extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
    }
    if (extraInfo.length > 0) {
      const extraDescripton = `(${extraInfo.join(', ')})`;
      if (argument.description) {
        return `${argument.description} ${extraDescripton}`;
      }
      return extraDescripton;
    }
    return argument.description;
  }

  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth || 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2; // between term and description
    function formatItem(term, description) {
      if (description) {
        const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
        return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
      }
      return term;
    }
    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    // Usage
    let output = [`Usage: ${helper.commandUsage(cmd)}`, ''];

    // Description
    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([helper.wrap(commandDescription, helpWidth, 0), '']);
    }

    // Arguments
    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
    });
    if (argumentList.length > 0) {
      output = output.concat(['Arguments:', formatList(argumentList), '']);
    }

    // Options
    const optionList = helper.visibleOptions(cmd).map((option) => {
      return formatItem(helper.optionTerm(option), helper.optionDescription(option));
    });
    if (optionList.length > 0) {
      output = output.concat(['Options:', formatList(optionList), '']);
    }

    if (this.showGlobalOptions) {
      const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
        return formatItem(helper.optionTerm(option), helper.optionDescription(option));
      });
      if (globalOptionList.length > 0) {
        output = output.concat(['Global Options:', formatList(globalOptionList), '']);
      }
    }

    // Commands
    const commandList = helper.visibleCommands(cmd).map((cmd) => {
      return formatItem(helper.subcommandTerm(cmd), helper.subcommandDescription(cmd));
    });
    if (commandList.length > 0) {
      output = output.concat(['Commands:', formatList(commandList), '']);
    }

    return output.join('\n');
  }

  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestGlobalOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper)
    );
  }

  /**
   * Wrap the given string to width characters per line, with lines after the first indented.
   * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
   *
   * @param {string} str
   * @param {number} width
   * @param {number} indent
   * @param {number} [minColumnWidth=40]
   * @return {string}
   *
   */

  wrap(str, width, indent, minColumnWidth = 40) {
    // Full \s characters, minus the linefeeds.
    const indents = ' \\f\\t\\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff';
    // Detect manually wrapped and indented strings by searching for line break followed by spaces.
    const manualIndent = new RegExp(`[\\n][${indents}]+`);
    if (str.match(manualIndent)) return str;
    // Do not wrap if not enough room for a wrapped column of text (as could end up with a word per line).
    const columnWidth = width - indent;
    if (columnWidth < minColumnWidth) return str;

    const leadingStr = str.slice(0, indent);
    const columnText = str.slice(indent).replace('\r\n', '\n');
    const indentString = ' '.repeat(indent);
    const zeroWidthSpace = '\u200B';
    const breaks = `\\s${zeroWidthSpace}`;
    // Match line end (so empty lines don't collapse),
    // or as much text as will fit in column, or excess text up to first break.
    const regex = new RegExp(`\n|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`, 'g');
    const lines = columnText.match(regex) || [];
    return leadingStr + lines.map((line, i) => {
      if (line === '\n') return ''; // preserve empty lines
      return ((i > 0) ? indentString : '') + line.trimEnd();
    }).join('\n');
  }
};

help.Help = Help$2;

var option = {};

const { InvalidArgumentError: InvalidArgumentError$1 } = error;

let Option$2 = class Option {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */

  constructor(flags, description) {
    this.flags = flags;
    this.description = description || '';

    this.required = flags.includes('<'); // A value must be supplied when the option is specified.
    this.optional = flags.includes('['); // A value is optional when the option is specified.
    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
    this.variadic = /\w\.\.\.[>\]]$/.test(flags); // The option can take multiple values.
    this.mandatory = false; // The option must have a value after parsing, which usually means it must be specified on command line.
    const optionFlags = splitOptionFlags$1(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith('--no-');
    }
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.presetArg = undefined;
    this.envVar = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
    this.conflictsWith = [];
    this.implied = undefined;
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Option}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
   * The custom processing (parseArg) is called.
   *
   * @example
   * new Option('--color').default('GREYSCALE').preset('RGB');
   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
   *
   * @param {*} arg
   * @return {Option}
   */

  preset(arg) {
    this.presetArg = arg;
    return this;
  }

  /**
   * Add option name(s) that conflict with this option.
   * An error will be displayed if conflicting options are found during parsing.
   *
   * @example
   * new Option('--rgb').conflicts('cmyk');
   * new Option('--js').conflicts(['ts', 'jsx']);
   *
   * @param {string | string[]} names
   * @return {Option}
   */

  conflicts(names) {
    this.conflictsWith = this.conflictsWith.concat(names);
    return this;
  }

  /**
   * Specify implied option values for when this option is set and the implied options are not.
   *
   * The custom processing (parseArg) is not called on the implied values.
   *
   * @example
   * program
   *   .addOption(new Option('--log', 'write logging information to file'))
   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
   *
   * @param {Object} impliedOptionValues
   * @return {Option}
   */
  implies(impliedOptionValues) {
    let newImplied = impliedOptionValues;
    if (typeof impliedOptionValues === 'string') {
      // string is not documented, but easy mistake and we can do what user probably intended.
      newImplied = { [impliedOptionValues]: true };
    }
    this.implied = Object.assign(this.implied || {}, newImplied);
    return this;
  }

  /**
   * Set environment variable to check for option value.
   *
   * An environment variable is only used if when processed the current option value is
   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
   *
   * @param {string} name
   * @return {Option}
   */

  env(name) {
    this.envVar = name;
    return this;
  }

  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */

  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }

  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */

  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }

  /**
   * @api private
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError$1(`Allowed choices are ${this.argChoices.join(', ')}.`);
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Return option name.
   *
   * @return {string}
   */

  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as a object attribute key.
   *
   * @return {string}
   * @api private
   */

  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }

  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @api private
   */

  is(arg) {
    return this.short === arg || this.long === arg;
  }

  /**
   * Return whether a boolean option.
   *
   * Options are one of boolean, negated, required argument, or optional argument.
   *
   * @return {boolean}
   * @api private
   */

  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
};

/**
 * This class is to make it easier to work with dual options, without changing the existing
 * implementation. We support separate dual options for separate positive and negative options,
 * like `--build` and `--no-build`, which share a single option value. This works nicely for some
 * use cases, but is tricky for others where we want separate behaviours despite
 * the single shared option value.
 */
let DualOptions$1 = class DualOptions {
  /**
   * @param {Option[]} options
   */
  constructor(options) {
    this.positiveOptions = new Map();
    this.negativeOptions = new Map();
    this.dualOptions = new Set();
    options.forEach(option => {
      if (option.negate) {
        this.negativeOptions.set(option.attributeName(), option);
      } else {
        this.positiveOptions.set(option.attributeName(), option);
      }
    });
    this.negativeOptions.forEach((value, key) => {
      if (this.positiveOptions.has(key)) {
        this.dualOptions.add(key);
      }
    });
  }

  /**
   * Did the value come from the option, and not from possible matching dual option?
   *
   * @param {*} value
   * @param {Option} option
   * @returns {boolean}
   */
  valueFromOption(value, option) {
    const optionKey = option.attributeName();
    if (!this.dualOptions.has(optionKey)) return true;

    // Use the value to deduce if (probably) came from the option.
    const preset = this.negativeOptions.get(optionKey).presetArg;
    const negativeValue = (preset !== undefined) ? preset : false;
    return option.negate === (negativeValue === value);
  }
};

/**
 * Convert string from kebab-case to camelCase.
 *
 * @param {string} str
 * @return {string}
 * @api private
 */

function camelcase(str) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Split the short and long flag out of something like '-m,--mixed <value>'
 *
 * @api private
 */

function splitOptionFlags$1(flags) {
  let shortFlag;
  let longFlag;
  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1])) shortFlag = flagParts.shift();
  longFlag = flagParts.shift();
  // Add support for lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

option.Option = Option$2;
option.splitOptionFlags = splitOptionFlags$1;
option.DualOptions = DualOptions$1;

var suggestSimilar$2 = {};

const maxDistance = 3;

function editDistance(a, b) {
  // https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance
  // Calculating optimal string alignment distance, no substring is edited more than once.
  // (Simple implementation.)

  // Quick early exit, return worst case.
  if (Math.abs(a.length - b.length) > maxDistance) return Math.max(a.length, b.length);

  // distance between prefix substrings of a and b
  const d = [];

  // pure deletions turn a into empty string
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  // pure insertions turn empty string into b
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  // fill matrix
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      // transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/**
 * Find close matches, restricted to same number of edits.
 *
 * @param {string} word
 * @param {string[]} candidates
 * @returns {string}
 */

function suggestSimilar$1(word, candidates) {
  if (!candidates || candidates.length === 0) return '';
  // remove possible duplicates
  candidates = Array.from(new Set(candidates));

  const searchingOptions = word.startsWith('--');
  if (searchingOptions) {
    word = word.slice(2);
    candidates = candidates.map(candidate => candidate.slice(2));
  }

  let similar = [];
  let bestDistance = maxDistance;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return; // no one character guesses

    const distance = editDistance(word, candidate);
    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        // better edit distance, throw away previous worse matches
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });

  similar.sort((a, b) => a.localeCompare(b));
  if (searchingOptions) {
    similar = similar.map(candidate => `--${candidate}`);
  }

  if (similar.length > 1) {
    return `\n(Did you mean one of ${similar.join(', ')}?)`;
  }
  if (similar.length === 1) {
    return `\n(Did you mean ${similar[0]}?)`;
  }
  return '';
}

suggestSimilar$2.suggestSimilar = suggestSimilar$1;

const EventEmitter = require$$0.EventEmitter;
const childProcess = require$$1;
const path = path$1;
const fs = fs$1;
const process$1 = require$$4;

const { Argument: Argument$1, humanReadableArgName } = argument;
const { CommanderError: CommanderError$1 } = error;
const { Help: Help$1 } = help;
const { Option: Option$1, splitOptionFlags, DualOptions } = option;
const { suggestSimilar } = suggestSimilar$2;

let Command$1 = class Command extends EventEmitter {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */

  constructor(name) {
    super();
    /** @type {Command[]} */
    this.commands = [];
    /** @type {Option[]} */
    this.options = [];
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = true;
    /** @type {Argument[]} */
    this.registeredArguments = [];
    this._args = this.registeredArguments; // deprecated old name
    /** @type {string[]} */
    this.args = []; // cli args with options removed
    this.rawArgs = [];
    this.processedArgs = []; // like .args but after custom processing and collecting variadic
    this._scriptPath = null;
    this._name = name || '';
    this._optionValues = {};
    this._optionValueSources = {}; // default, env, cli etc
    this._storeOptionsAsProperties = false;
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null; // custom name for executable
    this._executableDir = null; // custom search directory for subcommands
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = '';
    this._summary = '';
    this._argsDescription = undefined; // legacy
    this._enablePositionalOptions = false;
    this._passThroughOptions = false;
    this._lifeCycleHooks = {}; // a hash of arrays
    /** @type {boolean | string} */
    this._showHelpAfterError = false;
    this._showSuggestionAfterError = true;

    // see .configureOutput() for docs
    this._outputConfiguration = {
      writeOut: (str) => process$1.stdout.write(str),
      writeErr: (str) => process$1.stderr.write(str),
      getOutHelpWidth: () => process$1.stdout.isTTY ? process$1.stdout.columns : undefined,
      getErrHelpWidth: () => process$1.stderr.isTTY ? process$1.stderr.columns : undefined,
      outputError: (str, write) => write(str)
    };

    this._hidden = false;
    this._hasHelpOption = true;
    this._helpFlags = '-h, --help';
    this._helpDescription = 'display help for command';
    this._helpShortFlag = '-h';
    this._helpLongFlag = '--help';
    this._addImplicitHelpCommand = undefined; // Deliberately undefined, not decided whether true or false
    this._helpCommandName = 'help';
    this._helpCommandnameAndArgs = 'help [command]';
    this._helpCommandDescription = 'display help for command';
    this._helpConfiguration = {};
  }

  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} `this` command for chaining
   */
  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration;
    this._hasHelpOption = sourceCommand._hasHelpOption;
    this._helpFlags = sourceCommand._helpFlags;
    this._helpDescription = sourceCommand._helpDescription;
    this._helpShortFlag = sourceCommand._helpShortFlag;
    this._helpLongFlag = sourceCommand._helpLongFlag;
    this._helpCommandName = sourceCommand._helpCommandName;
    this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs;
    this._helpCommandDescription = sourceCommand._helpCommandDescription;
    this._helpConfiguration = sourceCommand._helpConfiguration;
    this._exitCallback = sourceCommand._exitCallback;
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
    this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
    this._allowExcessArguments = sourceCommand._allowExcessArguments;
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
    this._showHelpAfterError = sourceCommand._showHelpAfterError;
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;

    return this;
  }

  /**
   * @returns {Command[]}
   * @api private
   */

  _getCommandAndAncestors() {
    const result = [];
    for (let command = this; command; command = command.parent) {
      result.push(command);
    }
    return result;
  }

  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {Object|string} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {Object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */

  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === 'object' && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);

    const cmd = this.createCommand(name);
    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    cmd._hidden = !!(opts.noHelp || opts.hidden); // noHelp is deprecated old name for hidden
    cmd._executableFile = opts.executableFile || null; // Custom name for executable file, set missing to null to match constructor
    if (args) cmd.arguments(args);
    this.commands.push(cmd);
    cmd.parent = this;
    cmd.copyInheritedSettings(this);

    if (desc) return this;
    return cmd;
  }

  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */

  createCommand(name) {
    return new Command(name);
  }

  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */

  createHelp() {
    return Object.assign(new Help$1(), this.configureHelp());
  }

  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {Object} [configuration] - configuration options
   * @return {Command|Object} `this` command for chaining, or stored configuration
   */

  configureHelp(configuration) {
    if (configuration === undefined) return this._helpConfiguration;

    this._helpConfiguration = configuration;
    return this;
  }

  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // functions to change where being written, stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // matching functions to specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // functions based on what is being written out
   *     outputError(str, write) // used for displaying errors, and not used for displaying help
   *
   * @param {Object} [configuration] - configuration options
   * @return {Command|Object} `this` command for chaining, or stored configuration
   */

  configureOutput(configuration) {
    if (configuration === undefined) return this._outputConfiguration;

    Object.assign(this._outputConfiguration, configuration);
    return this;
  }

  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {boolean|string} [displayHelp]
   * @return {Command} `this` command for chaining
   */
  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
  }

  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */
  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion;
    return this;
  }

  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {Object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */

  addCommand(cmd, opts) {
    if (!cmd._name) {
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    }

    opts = opts || {};
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden) cmd._hidden = true; // modifying passed command due to existing implementation

    this.commands.push(cmd);
    cmd.parent = this;
    return this;
  }

  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */

  createArgument(name, description) {
    return new Argument$1(name, description);
  }

  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {Function|*} [fn] - custom argument processing function
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(name, description, fn, defaultValue) {
    const argument = this.createArgument(name, description);
    if (typeof fn === 'function') {
      argument.default(defaultValue).argParser(fn);
    } else {
      argument.default(fn);
    }
    this.addArgument(argument);
    return this;
  }

  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */

  arguments(names) {
    names.trim().split(/ +/).forEach((detail) => {
      this.argument(detail);
    });
    return this;
  }

  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(argument) {
    const previousArgument = this.registeredArguments.slice(-1)[0];
    if (previousArgument && previousArgument.variadic) {
      throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
    }
    if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
      throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
    }
    this.registeredArguments.push(argument);
    return this;
  }

  /**
   * Override default decision whether to add implicit help command.
   *
   *    addHelpCommand() // force on
   *    addHelpCommand(false); // force off
   *    addHelpCommand('help [cmd]', 'display help for [cmd]'); // force on with custom details
   *
   * @return {Command} `this` command for chaining
   */

  addHelpCommand(enableOrNameAndArgs, description) {
    if (enableOrNameAndArgs === false) {
      this._addImplicitHelpCommand = false;
    } else {
      this._addImplicitHelpCommand = true;
      if (typeof enableOrNameAndArgs === 'string') {
        this._helpCommandName = enableOrNameAndArgs.split(' ')[0];
        this._helpCommandnameAndArgs = enableOrNameAndArgs;
      }
      this._helpCommandDescription = description || this._helpCommandDescription;
    }
    return this;
  }

  /**
   * @return {boolean}
   * @api private
   */

  _hasImplicitHelpCommand() {
    if (this._addImplicitHelpCommand === undefined) {
      return this.commands.length && !this._actionHandler && !this._findCommand('help');
    }
    return this._addImplicitHelpCommand;
  }

  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */

  hook(event, listener) {
    const allowedValues = ['preSubcommand', 'preAction', 'postAction'];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
  }

  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */

  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = (err) => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err;
        }
      };
    }
    return this;
  }

  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @api private
   */

  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError$1(exitCode, code, message));
      // Expecting this line is not reached.
    }
    process$1.exit(exitCode);
  }

  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */

  action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this.registeredArguments.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }

  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */

  createOption(flags, description) {
    return new Option$1(flags, description);
  }

  /**
   * Wrap parseArgs to catch 'commander.invalidArgument'.
   *
   * @param {Option | Argument} target
   * @param {string} value
   * @param {*} previous
   * @param {string} invalidArgumentMessage
   * @api private
   */

  _callParseArg(target, value, previous, invalidArgumentMessage) {
    try {
      return target.parseArg(value, previous);
    } catch (err) {
      if (err.code === 'commander.invalidArgument') {
        const message = `${invalidArgumentMessage} ${err.message}`;
        this.error(message, { exitCode: err.exitCode, code: err.code });
      }
      throw err;
    }
  }

  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(option) {
    const oname = option.name();
    const name = option.attributeName();

    // store default value
    if (option.negate) {
      // --no-foo is special and defaults foo to true, unless a --foo option is already defined
      const positiveLongFlag = option.long.replace(/^--no-/, '--');
      if (!this._findOption(positiveLongFlag)) {
        this.setOptionValueWithSource(name, option.defaultValue === undefined ? true : option.defaultValue, 'default');
      }
    } else if (option.defaultValue !== undefined) {
      this.setOptionValueWithSource(name, option.defaultValue, 'default');
    }

    // register the option
    this.options.push(option);

    // handler for cli and env supplied values
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      // val is null for optional option used without an optional-argument.
      // val is undefined for boolean and negated option.
      if (val == null && option.presetArg !== undefined) {
        val = option.presetArg;
      }

      // custom processing
      const oldValue = this.getOptionValue(name);
      if (val !== null && option.parseArg) {
        val = this._callParseArg(option, val, oldValue, invalidValueMessage);
      } else if (val !== null && option.variadic) {
        val = option._concatValue(val, oldValue);
      }

      // Fill-in appropriate missing values. Long winded but easy to follow.
      if (val == null) {
        if (option.negate) {
          val = false;
        } else if (option.isBoolean() || option.optional) {
          val = true;
        } else {
          val = ''; // not normal, parseArg might have failed or be a mock function for testing
        }
      }
      this.setOptionValueWithSource(name, val, valueSource);
    };

    this.on('option:' + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
      handleOptionValue(val, invalidValueMessage, 'cli');
    });

    if (option.envVar) {
      this.on('optionEnv:' + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, 'env');
      });
    }

    return this;
  }

  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @api private
   */
  _optionEx(config, flags, description, fn, defaultValue) {
    if (typeof flags === 'object' && flags instanceof Option$1) {
      throw new Error('To add an Option object use addOption() instead of option() or requiredOption()');
    }
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === 'function') {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      // deprecated
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }

    return this.addOption(option);
  }

  /**
   * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
   * option-argument is indicated by `<>` and an optional option-argument by `[]`.
   *
   * See the README for more details, and see also addOption() and requiredOption().
   *
   * @example
   * program
   *     .option('-p, --pepper', 'add pepper')
   *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
   *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
   *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {Function|*} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  option(flags, description, parseArg, defaultValue) {
    return this._optionEx({}, flags, description, parseArg, defaultValue);
  }

  /**
  * Add a required option which must have a value after parsing. This usually means
  * the option must be specified on the command line. (Otherwise the same as .option().)
  *
  * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
  *
  * @param {string} flags
  * @param {string} [description]
  * @param {Function|*} [parseArg] - custom option processing function or default value
  * @param {*} [defaultValue]
  * @return {Command} `this` command for chaining
  */

  requiredOption(flags, description, parseArg, defaultValue) {
    return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
  }

  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {Boolean} [combine=true] - if `true` or omitted, an optional value can be specified directly after the flag.
   */
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param {Boolean} [allowUnknown=true] - if `true` or omitted, no error will be thrown
   * for unknown options.
   */
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }

  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {Boolean} [allowExcess=true] - if `true` or omitted, no error will be thrown
   * for excess arguments.
   */
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }

  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {Boolean} [positional=true]
   */
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional;
    return this;
  }

  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {Boolean} [passThrough=true]
   * for unknown options.
   */
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough;
    if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
      throw new Error('passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)');
    }
    return this;
  }

  /**
    * Whether to store option values as properties on command object,
    * or store separately (specify false). In both cases the option values can be accessed using .opts().
    *
    * @param {boolean} [storeAsProperties=true]
    * @return {Command} `this` command for chaining
    */

  storeOptionsAsProperties(storeAsProperties = true) {
    if (this.options.length) {
      throw new Error('call .storeOptionsAsProperties() before adding options');
    }
    // if (Object.keys(this._optionValues).length) {
    //   throw new Error('call .storeOptionsAsProperties() before setting option values');
    // }
    this._storeOptionsAsProperties = !!storeAsProperties;
    return this;
  }

  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {Object} value
   */

  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }

  /**
   * Store option value.
   *
   * @param {string} key
   * @param {Object} value
   * @return {Command} `this` command for chaining
   */

  setOptionValue(key, value) {
    return this.setOptionValueWithSource(key, value, undefined);
  }

  /**
    * Store option value and where the value came from.
    *
    * @param {string} key
    * @param {Object} value
    * @param {string} source - expected values are default/config/env/cli/implied
    * @return {Command} `this` command for chaining
    */

  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }

  /**
    * Get source of option value.
    * Expected values are default | config | env | cli | implied
    *
    * @param {string} key
    * @return {string}
    */

  getOptionValueSource(key) {
    return this._optionValueSources[key];
  }

  /**
    * Get source of option value. See also .optsWithGlobals().
    * Expected values are default | config | env | cli | implied
    *
    * @param {string} key
    * @return {string}
    */

  getOptionValueSourceWithGlobals(key) {
    // global overwrites local, like optsWithGlobals
    let source;
    this._getCommandAndAncestors().forEach((cmd) => {
      if (cmd.getOptionValueSource(key) !== undefined) {
        source = cmd.getOptionValueSource(key);
      }
    });
    return source;
  }

  /**
   * Get user arguments from implied or explicit arguments.
   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
   *
   * @api private
   */

  _prepareUserArgs(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    parseOptions = parseOptions || {};

    // Default to using process.argv
    if (argv === undefined) {
      argv = process$1.argv;
      // @ts-ignore: unknown property
      if (process$1.versions && process$1.versions.electron) {
        parseOptions.from = 'electron';
      }
    }
    this.rawArgs = argv.slice();

    // make it a little easier for callers by supporting various argv conventions
    let userArgs;
    switch (parseOptions.from) {
      case undefined:
      case 'node':
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case 'electron':
        // @ts-ignore: unknown property
        if (process$1.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case 'user':
        userArgs = argv.slice(0);
        break;
      default:
        throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
    }

    // Find default name for program from arguments.
    if (!this._name && this._scriptPath) this.nameFromFilename(this._scriptPath);
    this._name = this._name || 'program';

    return userArgs;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * @example
   * program.parse(process.argv);
   * program.parse(); // implicitly use process.argv and auto-detect node vs electron conventions
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {Object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */

  parse(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async. Returns a Promise.
   *
   * The default expectation is that the arguments are from node and have the application as argv[0]
   * and the script being run in argv[1], with user parameters after that.
   *
   * @example
   * await program.parseAsync(process.argv);
   * await program.parseAsync(); // implicitly use process.argv and auto-detect node vs electron conventions
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {Object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */

  async parseAsync(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    await this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Execute a sub-command executable.
   *
   * @api private
   */

  _executeSubCommand(subcommand, args) {
    args = args.slice();
    let launchWithNode = false; // Use node for source targets so do not need to get permissions correct, and on Windows.
    const sourceExt = ['.js', '.ts', '.tsx', '.mjs', '.cjs'];

    function findFile(baseDir, baseName) {
      // Look for specified file
      const localBin = path.resolve(baseDir, baseName);
      if (fs.existsSync(localBin)) return localBin;

      // Stop looking if candidate already has an expected extension.
      if (sourceExt.includes(path.extname(baseName))) return undefined;

      // Try all the extensions.
      const foundExt = sourceExt.find(ext => fs.existsSync(`${localBin}${ext}`));
      if (foundExt) return `${localBin}${foundExt}`;

      return undefined;
    }

    // Not checking for help first. Unlikely to have mandatory and executable, and can't robustly test for help flags in external command.
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // executableFile and executableDir might be full path, or just a name
    let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
    let executableDir = this._executableDir || '';
    if (this._scriptPath) {
      let resolvedScriptPath; // resolve possible symlink for installed npm binary
      try {
        resolvedScriptPath = fs.realpathSync(this._scriptPath);
      } catch (err) {
        resolvedScriptPath = this._scriptPath;
      }
      executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
    }

    // Look for a local file in preference to a command in PATH.
    if (executableDir) {
      let localFile = findFile(executableDir, executableFile);

      // Legacy search using prefix of script name instead of command name
      if (!localFile && !subcommand._executableFile && this._scriptPath) {
        const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
        if (legacyName !== this._name) {
          localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
        }
      }
      executableFile = localFile || executableFile;
    }

    launchWithNode = sourceExt.includes(path.extname(executableFile));

    let proc;
    if (process$1.platform !== 'win32') {
      if (launchWithNode) {
        args.unshift(executableFile);
        // add executable arguments to spawn
        args = incrementNodeInspectorPort(process$1.execArgv).concat(args);

        proc = childProcess.spawn(process$1.argv[0], args, { stdio: 'inherit' });
      } else {
        proc = childProcess.spawn(executableFile, args, { stdio: 'inherit' });
      }
    } else {
      args.unshift(executableFile);
      // add executable arguments to spawn
      args = incrementNodeInspectorPort(process$1.execArgv).concat(args);
      proc = childProcess.spawn(process$1.execPath, args, { stdio: 'inherit' });
    }

    if (!proc.killed) { // testing mainly to avoid leak warnings during unit tests with mocked spawn
      const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
      signals.forEach((signal) => {
        // @ts-ignore
        process$1.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            proc.kill(signal);
          }
        });
      });
    }

    // By default terminate process when spawned process terminates.
    // Suppressing the exit if exitCallback defined is a bit messy and of limited use, but does allow process to stay running!
    const exitCallback = this._exitCallback;
    if (!exitCallback) {
      proc.on('close', process$1.exit.bind(process$1));
    } else {
      proc.on('close', () => {
        exitCallback(new CommanderError$1(process$1.exitCode || 0, 'commander.executeSubCommandAsync', '(close)'));
      });
    }
    proc.on('error', (err) => {
      // @ts-ignore
      if (err.code === 'ENOENT') {
        const executableDirMessage = executableDir
          ? `searched for local subcommand relative to directory '${executableDir}'`
          : 'no directory for search for local subcommand, use .executableDir() to supply a custom directory';
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
      // @ts-ignore
      } else if (err.code === 'EACCES') {
        throw new Error(`'${executableFile}' not executable`);
      }
      if (!exitCallback) {
        process$1.exit(1);
      } else {
        const wrappedError = new CommanderError$1(1, 'commander.executeSubCommandAsync', '(error)');
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });

    // Store the reference to the child process
    this.runningCommand = proc;
  }

  /**
   * @api private
   */

  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand) this.help({ error: true });

    let promiseChain;
    promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, 'preSubcommand');
    promiseChain = this._chainOrCall(promiseChain, () => {
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        return subCommand._parseCommand(operands, unknown);
      }
    });
    return promiseChain;
  }

  /**
   * Invoke help directly if possible, or dispatch if necessary.
   * e.g. help foo
   *
   * @api private
   */

  _dispatchHelpCommand(subcommandName) {
    if (!subcommandName) {
      this.help();
    }
    const subCommand = this._findCommand(subcommandName);
    if (subCommand && !subCommand._executableHandler) {
      subCommand.help();
    }

    // Fallback to parsing the help flag to invoke the help.
    return this._dispatchSubcommand(subcommandName, [], [
      this._helpLongFlag || this._helpShortFlag
    ]);
  }

  /**
   * Check this.args against expected this.registeredArguments.
   *
   * @api private
   */

  _checkNumberOfArguments() {
    // too few
    this.registeredArguments.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name());
      }
    });
    // too many
    if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
      return;
    }
    if (this.args.length > this.registeredArguments.length) {
      this._excessArguments(this.args);
    }
  }

  /**
   * Process this.args using this.registeredArguments and save as this.processedArgs!
   *
   * @api private
   */

  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      // Extra processing for nice error message on parsing failure.
      let parsedValue = value;
      if (value !== null && argument.parseArg) {
        const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
        parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
      }
      return parsedValue;
    };

    this._checkNumberOfArguments();

    const processedArgs = [];
    this.registeredArguments.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue;
      if (declaredArg.variadic) {
        // Collect together remaining arguments for passing together as an array.
        if (index < this.args.length) {
          value = this.args.slice(index);
          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed);
            }, declaredArg.defaultValue);
          }
        } else if (value === undefined) {
          value = [];
        }
      } else if (index < this.args.length) {
        value = this.args[index];
        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
        }
      }
      processedArgs[index] = value;
    });
    this.processedArgs = processedArgs;
  }

  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {Promise|undefined} promise
   * @param {Function} fn
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCall(promise, fn) {
    // thenable
    if (promise && promise.then && typeof promise.then === 'function') {
      // already have a promise, chain callback
      return promise.then(() => fn());
    }
    // callback might return a promise
    return fn();
  }

  /**
   *
   * @param {Promise|undefined} promise
   * @param {string} event
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCallHooks(promise, event) {
    let result = promise;
    const hooks = [];
    this._getCommandAndAncestors()
      .reverse()
      .filter(cmd => cmd._lifeCycleHooks[event] !== undefined)
      .forEach(hookedCommand => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
    if (event === 'postAction') {
      hooks.reverse();
    }

    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this);
      });
    });
    return result;
  }

  /**
   *
   * @param {Promise|undefined} promise
   * @param {Command} subCommand
   * @param {string} event
   * @return {Promise|undefined}
   * @api private
   */

  _chainOrCallSubCommandHook(promise, subCommand, event) {
    let result = promise;
    if (this._lifeCycleHooks[event] !== undefined) {
      this._lifeCycleHooks[event].forEach((hook) => {
        result = this._chainOrCall(result, () => {
          return hook(this, subCommand);
        });
      });
    }
    return result;
  }

  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @api private
   */

  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    this._parseOptionsEnv(); // after cli, so parseArg not called on both cli and env
    this._parseOptionsImplied();
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);

    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    }
    if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
      return this._dispatchHelpCommand(operands[1]);
    }
    if (this._defaultCommandName) {
      outputHelpIfRequested(this, unknown); // Run the help for default command from parent rather than passing to default command
      return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
    }
    if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
      // probably missing subcommand and no handler, user needs help (and exit)
      this.help({ error: true });
    }

    outputHelpIfRequested(this, parsed.unknown);
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // We do not always call this check to avoid masking a "better" error, like unknown command.
    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }
    };

    const commandEvent = `command:${this.name()}`;
    if (this._actionHandler) {
      checkForUnknownOptions();
      this._processArguments();

      let promiseChain;
      promiseChain = this._chainOrCallHooks(promiseChain, 'preAction');
      promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
      if (this.parent) {
        promiseChain = this._chainOrCall(promiseChain, () => {
          this.parent.emit(commandEvent, operands, unknown); // legacy
        });
      }
      promiseChain = this._chainOrCallHooks(promiseChain, 'postAction');
      return promiseChain;
    }
    if (this.parent && this.parent.listenerCount(commandEvent)) {
      checkForUnknownOptions();
      this._processArguments();
      this.parent.emit(commandEvent, operands, unknown); // legacy
    } else if (operands.length) {
      if (this._findCommand('*')) { // legacy default command
        return this._dispatchSubcommand('*', operands, unknown);
      }
      if (this.listenerCount('command:*')) {
        // skip option check, emit event for possible misspelling suggestion
        this.emit('command:*', operands, unknown);
      } else if (this.commands.length) {
        this.unknownCommand();
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    } else if (this.commands.length) {
      checkForUnknownOptions();
      // This command has subcommands and nothing hooked up at this level, so display help (and exit).
      this.help({ error: true });
    } else {
      checkForUnknownOptions();
      this._processArguments();
      // fall through for caller to handle after calling .parse()
    }
  }

  /**
   * Find matching command.
   *
   * @api private
   */
  _findCommand(name) {
    if (!name) return undefined;
    return this.commands.find(cmd => cmd._name === name || cmd._aliases.includes(name));
  }

  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @api private
   */

  _findOption(arg) {
    return this.options.find(option => option.is(arg));
  }

  /**
   * Display an error message if a mandatory option does not have a value.
   * Called after checking for help flags in leaf subcommand.
   *
   * @api private
   */

  _checkForMissingMandatoryOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd.options.forEach((anOption) => {
        if (anOption.mandatory && (cmd.getOptionValue(anOption.attributeName()) === undefined)) {
          cmd.missingMandatoryOptionValue(anOption);
        }
      });
    });
  }

  /**
   * Display an error message if conflicting options are used together in this.
   *
   * @api private
   */
  _checkForConflictingLocalOptions() {
    const definedNonDefaultOptions = this.options.filter(
      (option) => {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined) {
          return false;
        }
        return this.getOptionValueSource(optionKey) !== 'default';
      }
    );

    const optionsWithConflicting = definedNonDefaultOptions.filter(
      (option) => option.conflictsWith.length > 0
    );

    optionsWithConflicting.forEach((option) => {
      const conflictingAndDefined = definedNonDefaultOptions.find((defined) =>
        option.conflictsWith.includes(defined.attributeName())
      );
      if (conflictingAndDefined) {
        this._conflictingOption(option, conflictingAndDefined);
      }
    });
  }

  /**
   * Display an error message if conflicting options are used together.
   * Called after checking for help flags in leaf subcommand.
   *
   * @api private
   */
  _checkForConflictingOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd._checkForConflictingLocalOptions();
    });
  }

  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {String[]} argv
   * @return {{operands: String[], unknown: String[]}}
   */

  parseOptions(argv) {
    const operands = []; // operands, not options or values
    const unknown = []; // first unknown option and remaining unknown args
    let dest = operands;
    const args = argv.slice();

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-';
    }

    // parse options
    let activeVariadicOption = null;
    while (args.length) {
      const arg = args.shift();

      // literal
      if (arg === '--') {
        if (dest === unknown) dest.push(arg);
        dest.push(...args);
        break;
      }

      if (activeVariadicOption && !maybeOption(arg)) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;

      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        // recognised option, call listener to assign value with possible custom processing
        if (option) {
          if (option.required) {
            const value = args.shift();
            if (value === undefined) this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            // historical behaviour is optional value is following arg unless an option
            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift();
            }
            this.emit(`option:${option.name()}`, value);
          } else { // boolean flag
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }

      // Look for combo options following single dash, eat first one if known.
      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (option.required || (option.optional && this._combineFlagAndOptionalValue)) {
            // option with value following in same argument
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            // boolean option, emit and put back remainder of arg for further processing
            this.emit(`option:${option.name()}`);
            args.unshift(`-${arg.slice(2)}`);
          }
          continue;
        }
      }

      // Look for known long flag with value, like --foo=bar
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=');
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }

      // Not a recognised option by this command.
      // Might be a command-argument, or subcommand option, or unknown option, or help command or option.

      // An unknown option means further arguments also classified as unknown so can be reprocessed by subcommands.
      if (maybeOption(arg)) {
        dest = unknown;
      }

      // If using positionalOptions, stop processing our options at subcommand.
      if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
        if (this._findCommand(arg)) {
          operands.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        } else if (arg === this._helpCommandName && this._hasImplicitHelpCommand()) {
          operands.push(arg);
          if (args.length > 0) operands.push(...args);
          break;
        } else if (this._defaultCommandName) {
          unknown.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        }
      }

      // If using passThroughOptions, stop processing options at first command-argument.
      if (this._passThroughOptions) {
        dest.push(arg);
        if (args.length > 0) dest.push(...args);
        break;
      }

      // add arg
      dest.push(arg);
    }

    return { operands, unknown };
  }

  /**
   * Return an object containing local option values as key-value pairs.
   *
   * @return {Object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      // Preserve original behaviour so backwards compatible when still using properties
      const result = {};
      const len = this.options.length;

      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] = key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }

    return this._optionValues;
  }

  /**
   * Return an object containing merged local and global option values as key-value pairs.
   *
   * @return {Object}
   */
  optsWithGlobals() {
    // globals overwrite locals
    return this._getCommandAndAncestors().reduce(
      (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
      {}
    );
  }

  /**
   * Display error message and exit (or call exitOverride).
   *
   * @param {string} message
   * @param {Object} [errorOptions]
   * @param {string} [errorOptions.code] - an id string representing the error
   * @param {number} [errorOptions.exitCode] - used with process.exit
   */
  error(message, errorOptions) {
    // output handling
    this._outputConfiguration.outputError(`${message}\n`, this._outputConfiguration.writeErr);
    if (typeof this._showHelpAfterError === 'string') {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`);
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr('\n');
      this.outputHelp({ error: true });
    }

    // exit handling
    const config = errorOptions || {};
    const exitCode = config.exitCode || 1;
    const code = config.code || 'commander.error';
    this._exit(exitCode, code, message);
  }

  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @api private
   */
  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in process$1.env) {
        const optionKey = option.attributeName();
        // Priority check. Do not overwrite cli or options from unknown source (client-code).
        if (this.getOptionValue(optionKey) === undefined || ['default', 'config', 'env'].includes(this.getOptionValueSource(optionKey))) {
          if (option.required || option.optional) { // option can take a value
            // keep very simple, optional always takes value
            this.emit(`optionEnv:${option.name()}`, process$1.env[option.envVar]);
          } else { // boolean
            // keep very simple, only care that envVar defined and not the value
            this.emit(`optionEnv:${option.name()}`);
          }
        }
      }
    });
  }

  /**
   * Apply any implied option values, if option is undefined or default value.
   *
   * @api private
   */
  _parseOptionsImplied() {
    const dualHelper = new DualOptions(this.options);
    const hasCustomOptionValue = (optionKey) => {
      return this.getOptionValue(optionKey) !== undefined && !['default', 'implied'].includes(this.getOptionValueSource(optionKey));
    };
    this.options
      .filter(option => (option.implied !== undefined) &&
        hasCustomOptionValue(option.attributeName()) &&
        dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option))
      .forEach((option) => {
        Object.keys(option.implied)
          .filter(impliedKey => !hasCustomOptionValue(impliedKey))
          .forEach(impliedKey => {
            this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], 'implied');
          });
      });
  }

  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @api private
   */

  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this.error(message, { code: 'commander.missingArgument' });
  }

  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @api private
   */

  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`;
    this.error(message, { code: 'commander.optionMissingArgument' });
  }

  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @api private
   */

  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this.error(message, { code: 'commander.missingMandatoryOptionValue' });
  }

  /**
   * `Option` conflicts with another option.
   *
   * @param {Option} option
   * @param {Option} conflictingOption
   * @api private
   */
  _conflictingOption(option, conflictingOption) {
    // The calling code does not know whether a negated option is the source of the
    // value, so do some work to take an educated guess.
    const findBestOptionFromValue = (option) => {
      const optionKey = option.attributeName();
      const optionValue = this.getOptionValue(optionKey);
      const negativeOption = this.options.find(target => target.negate && optionKey === target.attributeName());
      const positiveOption = this.options.find(target => !target.negate && optionKey === target.attributeName());
      if (negativeOption && (
        (negativeOption.presetArg === undefined && optionValue === false) ||
        (negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)
      )) {
        return negativeOption;
      }
      return positiveOption || option;
    };

    const getErrorMessage = (option) => {
      const bestOption = findBestOptionFromValue(option);
      const optionKey = bestOption.attributeName();
      const source = this.getOptionValueSource(optionKey);
      if (source === 'env') {
        return `environment variable '${bestOption.envVar}'`;
      }
      return `option '${bestOption.flags}'`;
    };

    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
    this.error(message, { code: 'commander.conflictingOption' });
  }

  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @api private
   */

  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    let suggestion = '';

    if (flag.startsWith('--') && this._showSuggestionAfterError) {
      // Looping to pick up the global options too
      let candidateFlags = [];
      let command = this;
      do {
        const moreFlags = command.createHelp().visibleOptions(command)
          .filter(option => option.long)
          .map(option => option.long);
        candidateFlags = candidateFlags.concat(moreFlags);
        command = command.parent;
      } while (command && !command._enablePositionalOptions);
      suggestion = suggestSimilar(flag, candidateFlags);
    }

    const message = `error: unknown option '${flag}'${suggestion}`;
    this.error(message, { code: 'commander.unknownOption' });
  }

  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @api private
   */

  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return;

    const expected = this.registeredArguments.length;
    const s = (expected === 1) ? '' : 's';
    const forSubcommand = this.parent ? ` for '${this.name()}'` : '';
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
    this.error(message, { code: 'commander.excessArguments' });
  }

  /**
   * Unknown command.
   *
   * @api private
   */

  unknownCommand() {
    const unknownName = this.args[0];
    let suggestion = '';

    if (this._showSuggestionAfterError) {
      const candidateNames = [];
      this.createHelp().visibleCommands(this).forEach((command) => {
        candidateNames.push(command.name());
        // just visible alias
        if (command.alias()) candidateNames.push(command.alias());
      });
      suggestion = suggestSimilar(unknownName, candidateNames);
    }

    const message = `error: unknown command '${unknownName}'${suggestion}`;
    this.error(message, { code: 'commander.unknownCommand' });
  }

  /**
   * Get or set the program version.
   *
   * This method auto-registers the "-V, --version" option which will print the version number.
   *
   * You can optionally supply the flags and description to override the defaults.
   *
   * @param {string} [str]
   * @param {string} [flags]
   * @param {string} [description]
   * @return {this | string | undefined} `this` command for chaining, or version string if no arguments
   */

  version(str, flags, description) {
    if (str === undefined) return this._version;
    this._version = str;
    flags = flags || '-V, --version';
    description = description || 'output the version number';
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName(); // [sic] not defined in constructor, partly legacy, partly only needed at root
    this.options.push(versionOption);
    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`);
      this._exit(0, 'commander.version', str);
    });
    return this;
  }

  /**
   * Set the description.
   *
   * @param {string} [str]
   * @param {Object} [argsDescription]
   * @return {string|Command}
   */
  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined) return this._description;
    this._description = str;
    if (argsDescription) {
      this._argsDescription = argsDescription;
    }
    return this;
  }

  /**
   * Set the summary. Used when listed as subcommand of parent.
   *
   * @param {string} [str]
   * @return {string|Command}
   */
  summary(str) {
    if (str === undefined) return this._summary;
    this._summary = str;
    return this;
  }

  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {string|Command}
   */

  alias(alias) {
    if (alias === undefined) return this._aliases[0]; // just return first, for backwards compatibility

    /** @type {Command} */
    let command = this;
    if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
      // assume adding alias for last added executable subcommand, rather than this
      command = this.commands[this.commands.length - 1];
    }

    if (alias === command._name) throw new Error('Command alias can\'t be the same as its name');

    command._aliases.push(alias);
    return this;
  }

  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {string[]|Command}
   */

  aliases(aliases) {
    // Getter for the array of aliases is the main reason for having aliases() in addition to alias().
    if (aliases === undefined) return this._aliases;

    aliases.forEach((alias) => this.alias(alias));
    return this;
  }

  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {String|Command}
   */

  usage(str) {
    if (str === undefined) {
      if (this._usage) return this._usage;

      const args = this.registeredArguments.map((arg) => {
        return humanReadableArgName(arg);
      });
      return [].concat(
        (this.options.length || this._hasHelpOption ? '[options]' : []),
        (this.commands.length ? '[command]' : []),
        (this.registeredArguments.length ? args : [])
      ).join(' ');
    }

    this._usage = str;
    return this;
  }

  /**
   * Get or set the name of the command.
   *
   * @param {string} [str]
   * @return {string|Command}
   */

  name(str) {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }

  /**
   * Set the name of the command from script filename, such as process.argv[1],
   * or require.main.filename, or __filename.
   *
   * (Used internally and public although not documented in README.)
   *
   * @example
   * program.nameFromFilename(require.main.filename);
   *
   * @param {string} filename
   * @return {Command}
   */

  nameFromFilename(filename) {
    this._name = path.basename(filename, path.extname(filename));

    return this;
  }

  /**
   * Get or set the directory for searching for executable subcommands of this command.
   *
   * @example
   * program.executableDir(__dirname);
   * // or
   * program.executableDir('subcommands');
   *
   * @param {string} [path]
   * @return {string|null|Command}
   */

  executableDir(path) {
    if (path === undefined) return this._executableDir;
    this._executableDir = path;
    return this;
  }

  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */

  helpInformation(contextOptions) {
    const helper = this.createHelp();
    if (helper.helpWidth === undefined) {
      helper.helpWidth = (contextOptions && contextOptions.error) ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
    }
    return helper.formatHelp(this, helper);
  }

  /**
   * @api private
   */

  _getHelpContext(contextOptions) {
    contextOptions = contextOptions || {};
    const context = { error: !!contextOptions.error };
    let write;
    if (context.error) {
      write = (arg) => this._outputConfiguration.writeErr(arg);
    } else {
      write = (arg) => this._outputConfiguration.writeOut(arg);
    }
    context.write = contextOptions.write || write;
    context.command = this;
    return context;
  }

  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === 'function') {
      deprecatedCallback = contextOptions;
      contextOptions = undefined;
    }
    const context = this._getHelpContext(contextOptions);

    this._getCommandAndAncestors().reverse().forEach(command => command.emit('beforeAllHelp', context));
    this.emit('beforeHelp', context);

    let helpInformation = this.helpInformation(context);
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (typeof helpInformation !== 'string' && !Buffer.isBuffer(helpInformation)) {
        throw new Error('outputHelp callback must return a string or a Buffer');
      }
    }
    context.write(helpInformation);

    if (this._helpLongFlag) {
      this.emit(this._helpLongFlag); // deprecated
    }
    this.emit('afterHelp', context);
    this._getCommandAndAncestors().forEach(command => command.emit('afterAllHelp', context));
  }

  /**
   * You can pass in flags and a description to override the help
   * flags and help description for your command. Pass in false to
   * disable the built-in help option.
   *
   * @param {string | boolean} [flags]
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */

  helpOption(flags, description) {
    if (typeof flags === 'boolean') {
      this._hasHelpOption = flags;
      return this;
    }
    this._helpFlags = flags || this._helpFlags;
    this._helpDescription = description || this._helpDescription;

    const helpFlags = splitOptionFlags(this._helpFlags);
    this._helpShortFlag = helpFlags.shortFlag;
    this._helpLongFlag = helpFlags.longFlag;

    return this;
  }

  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = process$1.exitCode || 0;
    if (exitCode === 0 && contextOptions && typeof contextOptions !== 'function' && contextOptions.error) {
      exitCode = 1;
    }
    // message: do not have all displayed text available so only passing placeholder.
    this._exit(exitCode, 'commander.help', '(outputHelp)');
  }

  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {string | Function} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */
  addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, (context) => {
      let helpStr;
      if (typeof text === 'function') {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      // Ignore falsy value when nothing to output.
      if (helpStr) {
        context.write(`${helpStr}\n`);
      }
    });
    return this;
  }
};

/**
 * Output help information if help flags specified
 *
 * @param {Command} cmd - command to output help for
 * @param {Array} args - array of options to search for help flags
 * @api private
 */

function outputHelpIfRequested(cmd, args) {
  const helpOption = cmd._hasHelpOption && args.find(arg => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
  if (helpOption) {
    cmd.outputHelp();
    // (Do not have all displayed text available so only passing placeholder.)
    cmd._exit(0, 'commander.helpDisplayed', '(outputHelp)');
  }
}

/**
 * Scan arguments and increment port number for inspect calls (to avoid conflicts when spawning new command).
 *
 * @param {string[]} args - array of arguments from node.execArgv
 * @returns {string[]}
 * @api private
 */

function incrementNodeInspectorPort(args) {
  // Testing for these options:
  //  --inspect[=[host:]port]
  //  --inspect-brk[=[host:]port]
  //  --inspect-port=[host:]port
  return args.map((arg) => {
    if (!arg.startsWith('--inspect')) {
      return arg;
    }
    let debugOption;
    let debugHost = '127.0.0.1';
    let debugPort = '9229';
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      // e.g. --inspect
      debugOption = match[1];
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        // e.g. --inspect=1234
        debugPort = match[3];
      } else {
        // e.g. --inspect=localhost
        debugHost = match[3];
      }
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
      // e.g. --inspect=localhost:1234
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }

    if (debugOption && debugPort !== '0') {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}

command.Command = Command$1;

(function (module, exports) {
	const { Argument } = argument;
	const { Command } = command;
	const { CommanderError, InvalidArgumentError } = error;
	const { Help } = help;
	const { Option } = option;

	/**
	 * Expose the root command.
	 */

	exports = module.exports = new Command();
	exports.program = exports; // More explicit access to global command.
	// createArgument, createCommand, and createOption are implicitly available as they are methods on program.

	/**
	 * Expose classes
	 */

	exports.Command = Command;
	exports.Option = Option;
	exports.Argument = Argument;
	exports.Help = Help;

	exports.CommanderError = CommanderError;
	exports.InvalidArgumentError = InvalidArgumentError;
	exports.InvalidOptionArgumentError = InvalidArgumentError; // Deprecated 
} (commander$1, commander$1.exports));

var commanderExports = commander$1.exports;
var commander = /*@__PURE__*/getDefaultExportFromCjs(commanderExports);

// wrapper to provide named exports for ESM.
const {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError, // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = commander;

var ansiStyles$1 = {exports: {}};

var colorName;
var hasRequiredColorName;

function requireColorName () {
	if (hasRequiredColorName) return colorName;
	hasRequiredColorName = 1;

	colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};
	return colorName;
}

/* MIT license */

var conversions;
var hasRequiredConversions;

function requireConversions () {
	if (hasRequiredConversions) return conversions;
	hasRequiredConversions = 1;
	/* eslint-disable no-mixed-operators */
	const cssKeywords = requireColorName();

	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	const reverseKeywords = {};
	for (const key of Object.keys(cssKeywords)) {
		reverseKeywords[cssKeywords[key]] = key;
	}

	const convert = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	conversions = convert;

	// Hide .channels and .labels properties
	for (const model of Object.keys(convert)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		const {channels, labels} = convert[model];
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}

	convert.rgb.hsl = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		const delta = max - min;
		let h;
		let s;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		const l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert.rgb.hsv = function (rgb) {
		let rdif;
		let gdif;
		let bdif;
		let h;
		let s;

		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const v = Math.max(r, g, b);
		const diff = v - Math.min(r, g, b);
		const diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = 0;
			s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}

			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert.rgb.hwb = function (rgb) {
		const r = rgb[0];
		const g = rgb[1];
		let b = rgb[2];
		const h = convert.rgb.hsl(rgb)[0];
		const w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert.rgb.cmyk = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		const k = Math.min(1 - r, 1 - g, 1 - b);
		const c = (1 - r - k) / (1 - k) || 0;
		const m = (1 - g - k) / (1 - k) || 0;
		const y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	function comparativeDistance(x, y) {
		/*
			See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
		*/
		return (
			((x[0] - y[0]) ** 2) +
			((x[1] - y[1]) ** 2) +
			((x[2] - y[2]) ** 2)
		);
	}

	convert.rgb.keyword = function (rgb) {
		const reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		let currentClosestDistance = Infinity;
		let currentClosestKeyword;

		for (const keyword of Object.keys(cssKeywords)) {
			const value = cssKeywords[keyword];

			// Compute comparative distance
			const distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}

		return currentClosestKeyword;
	};

	convert.keyword.rgb = function (keyword) {
		return cssKeywords[keyword];
	};

	convert.rgb.xyz = function (rgb) {
		let r = rgb[0] / 255;
		let g = rgb[1] / 255;
		let b = rgb[2] / 255;

		// Assume sRGB
		r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
		g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
		b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

		const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert.rgb.lab = function (rgb) {
		const xyz = convert.rgb.xyz(rgb);
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.hsl.rgb = function (hsl) {
		const h = hsl[0] / 360;
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;
		let t2;
		let t3;
		let val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		const t1 = 2 * l - t2;

		const rgb = [0, 0, 0];
		for (let i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}

			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert.hsl.hsv = function (hsl) {
		const h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;
		let smin = s;
		const lmin = Math.max(l, 0.01);

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		const v = (l + s) / 2;
		const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert.hsv.rgb = function (hsv) {
		const h = hsv[0] / 60;
		const s = hsv[1] / 100;
		let v = hsv[2] / 100;
		const hi = Math.floor(h) % 6;

		const f = h - Math.floor(h);
		const p = 255 * v * (1 - s);
		const q = 255 * v * (1 - (s * f));
		const t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert.hsv.hsl = function (hsv) {
		const h = hsv[0];
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;
		const vmin = Math.max(v, 0.01);
		let sl;
		let l;

		l = (2 - s) * v;
		const lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert.hwb.rgb = function (hwb) {
		const h = hwb[0] / 360;
		let wh = hwb[1] / 100;
		let bl = hwb[2] / 100;
		const ratio = wh + bl;
		let f;

		// Wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		const i = Math.floor(6 * h);
		const v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		const n = wh + f * (v - wh); // Linear interpolation

		let r;
		let g;
		let b;
		/* eslint-disable max-statements-per-line,no-multi-spaces */
		switch (i) {
			default:
			case 6:
			case 0: r = v;  g = n;  b = wh; break;
			case 1: r = n;  g = v;  b = wh; break;
			case 2: r = wh; g = v;  b = n; break;
			case 3: r = wh; g = n;  b = v; break;
			case 4: r = n;  g = wh; b = v; break;
			case 5: r = v;  g = wh; b = n; break;
		}
		/* eslint-enable max-statements-per-line,no-multi-spaces */

		return [r * 255, g * 255, b * 255];
	};

	convert.cmyk.rgb = function (cmyk) {
		const c = cmyk[0] / 100;
		const m = cmyk[1] / 100;
		const y = cmyk[2] / 100;
		const k = cmyk[3] / 100;

		const r = 1 - Math.min(1, c * (1 - k) + k);
		const g = 1 - Math.min(1, m * (1 - k) + k);
		const b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.rgb = function (xyz) {
		const x = xyz[0] / 100;
		const y = xyz[1] / 100;
		const z = xyz[2] / 100;
		let r;
		let g;
		let b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

		// Assume sRGB
		r = r > 0.0031308
			? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.lab = function (xyz) {
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.lab.xyz = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let x;
		let y;
		let z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		const y2 = y ** 3;
		const x2 = x ** 3;
		const z2 = z ** 3;
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert.lab.lch = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let h;

		const hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		const c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert.lch.lab = function (lch) {
		const l = lch[0];
		const c = lch[1];
		const h = lch[2];

		const hr = h / 360 * 2 * Math.PI;
		const a = c * Math.cos(hr);
		const b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert.rgb.ansi16 = function (args, saturation = null) {
		const [r, g, b] = args;
		let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		let ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert.hsv.ansi16 = function (args) {
		// Optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};

	convert.rgb.ansi256 = function (args) {
		const r = args[0];
		const g = args[1];
		const b = args[2];

		// We use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		const ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert.ansi16.rgb = function (args) {
		let color = args % 10;

		// Handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		const mult = (~~(args > 50) + 1) * 0.5;
		const r = ((color & 1) * mult) * 255;
		const g = (((color >> 1) & 1) * mult) * 255;
		const b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert.ansi256.rgb = function (args) {
		// Handle greyscale
		if (args >= 232) {
			const c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		let rem;
		const r = Math.floor(args / 36) / 5 * 255;
		const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		const b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert.rgb.hex = function (args) {
		const integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.hex.rgb = function (args) {
		const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		let colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(char => {
				return char + char;
			}).join('');
		}

		const integer = parseInt(colorString, 16);
		const r = (integer >> 16) & 0xFF;
		const g = (integer >> 8) & 0xFF;
		const b = integer & 0xFF;

		return [r, g, b];
	};

	convert.rgb.hcg = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const max = Math.max(Math.max(r, g), b);
		const min = Math.min(Math.min(r, g), b);
		const chroma = (max - min);
		let grayscale;
		let hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert.hsl.hcg = function (hsl) {
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;

		const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

		let f = 0;
		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert.hsv.hcg = function (hsv) {
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;

		const c = s * v;
		let f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert.hcg.rgb = function (hcg) {
		const h = hcg[0] / 360;
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		const pure = [0, 0, 0];
		const hi = (h % 1) * 6;
		const v = hi % 1;
		const w = 1 - v;
		let mg = 0;

		/* eslint-disable max-statements-per-line */
		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}
		/* eslint-enable max-statements-per-line */

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert.hcg.hsv = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const v = c + g * (1.0 - c);
		let f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert.hcg.hsl = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const l = g * (1.0 - c) + 0.5 * c;
		let s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert.hcg.hwb = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;
		const v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert.hwb.hcg = function (hwb) {
		const w = hwb[1] / 100;
		const b = hwb[2] / 100;
		const v = 1 - b;
		const c = v - w;
		let g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert.gray.hsl = function (args) {
		return [0, 0, args[0]];
	};

	convert.gray.hsv = convert.gray.hsl;

	convert.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert.gray.hex = function (gray) {
		const val = Math.round(gray[0] / 100 * 255) & 0xFF;
		const integer = (val << 16) + (val << 8) + val;

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.rgb.gray = function (rgb) {
		const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};
	return conversions;
}

var route;
var hasRequiredRoute;

function requireRoute () {
	if (hasRequiredRoute) return route;
	hasRequiredRoute = 1;
	const conversions = requireConversions();

	/*
		This function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		const graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		const models = Object.keys(conversions);

		for (let len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		const graph = buildGraph();
		const queue = [fromModel]; // Unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			const current = queue.pop();
			const adjacents = Object.keys(conversions[current]);

			for (let len = adjacents.length, i = 0; i < len; i++) {
				const adjacent = adjacents[i];
				const node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		const path = [graph[toModel].parent, toModel];
		let fn = conversions[graph[toModel].parent][toModel];

		let cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	route = function (fromModel) {
		const graph = deriveBFS(fromModel);
		const conversion = {};

		const models = Object.keys(graph);
		for (let len = models.length, i = 0; i < len; i++) {
			const toModel = models[i];
			const node = graph[toModel];

			if (node.parent === null) {
				// No possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};
	return route;
}

var colorConvert;
var hasRequiredColorConvert;

function requireColorConvert () {
	if (hasRequiredColorConvert) return colorConvert;
	hasRequiredColorConvert = 1;
	const conversions = requireConversions();
	const route = requireRoute();

	const convert = {};

	const models = Object.keys(conversions);

	function wrapRaw(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];
			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			return fn(args);
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];

			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			const result = fn(args);

			// We're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (let len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(fromModel => {
		convert[fromModel] = {};

		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

		const routes = route(fromModel);
		const routeModels = Object.keys(routes);

		routeModels.forEach(toModel => {
			const fn = routes[toModel];

			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	colorConvert = convert;
	return colorConvert;
}

ansiStyles$1.exports;

(function (module) {

	const wrapAnsi16 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${code + offset}m`;
	};

	const wrapAnsi256 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${38 + offset};5;${code}m`;
	};

	const wrapAnsi16m = (fn, offset) => (...args) => {
		const rgb = fn(...args);
		return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
	};

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	const setLazyProperty = (object, property, get) => {
		Object.defineProperty(object, property, {
			get: () => {
				const value = get();

				Object.defineProperty(object, property, {
					value,
					enumerable: true,
					configurable: true
				});

				return value;
			},
			enumerable: true,
			configurable: true
		});
	};

	/** @type {typeof import('color-convert')} */
	let colorConvert;
	const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
		if (colorConvert === undefined) {
			colorConvert = requireColorConvert();
		}

		const offset = isBackground ? 10 : 0;
		const styles = {};

		for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
			const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
			if (sourceSpace === targetSpace) {
				styles[name] = wrap(identity, offset);
			} else if (typeof suite === 'object') {
				styles[name] = wrap(suite[targetSpace], offset);
			}
		}

		return styles;
	};

	function assembleStyles() {
		const codes = new Map();
		const styles = {
			modifier: {
				reset: [0, 0],
				// 21 isn't widely supported and 22 does the same thing
				bold: [1, 22],
				dim: [2, 22],
				italic: [3, 23],
				underline: [4, 24],
				inverse: [7, 27],
				hidden: [8, 28],
				strikethrough: [9, 29]
			},
			color: {
				black: [30, 39],
				red: [31, 39],
				green: [32, 39],
				yellow: [33, 39],
				blue: [34, 39],
				magenta: [35, 39],
				cyan: [36, 39],
				white: [37, 39],

				// Bright color
				blackBright: [90, 39],
				redBright: [91, 39],
				greenBright: [92, 39],
				yellowBright: [93, 39],
				blueBright: [94, 39],
				magentaBright: [95, 39],
				cyanBright: [96, 39],
				whiteBright: [97, 39]
			},
			bgColor: {
				bgBlack: [40, 49],
				bgRed: [41, 49],
				bgGreen: [42, 49],
				bgYellow: [43, 49],
				bgBlue: [44, 49],
				bgMagenta: [45, 49],
				bgCyan: [46, 49],
				bgWhite: [47, 49],

				// Bright color
				bgBlackBright: [100, 49],
				bgRedBright: [101, 49],
				bgGreenBright: [102, 49],
				bgYellowBright: [103, 49],
				bgBlueBright: [104, 49],
				bgMagentaBright: [105, 49],
				bgCyanBright: [106, 49],
				bgWhiteBright: [107, 49]
			}
		};

		// Alias bright black as gray (and grey)
		styles.color.gray = styles.color.blackBright;
		styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
		styles.color.grey = styles.color.blackBright;
		styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

		for (const [groupName, group] of Object.entries(styles)) {
			for (const [styleName, style] of Object.entries(group)) {
				styles[styleName] = {
					open: `\u001B[${style[0]}m`,
					close: `\u001B[${style[1]}m`
				};

				group[styleName] = styles[styleName];

				codes.set(style[0], style[1]);
			}

			Object.defineProperty(styles, groupName, {
				value: group,
				enumerable: false
			});
		}

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});

		styles.color.close = '\u001B[39m';
		styles.bgColor.close = '\u001B[49m';

		setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
		setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

		return styles;
	}

	// Make the export immutable
	Object.defineProperty(module, 'exports', {
		enumerable: true,
		get: assembleStyles
	}); 
} (ansiStyles$1));

var ansiStylesExports = ansiStyles$1.exports;

var hasFlag$1 = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};

const os = require$$0$1;
const tty = require$$1$1;
const hasFlag = hasFlag$1;

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

var supportsColor_1 = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};

const stringReplaceAll$1 = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex$1 = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

var util = {
	stringReplaceAll: stringReplaceAll$1,
	stringEncaseCRLFWithFirstIndex: stringEncaseCRLFWithFirstIndex$1
};

var templates;
var hasRequiredTemplates;

function requireTemplates () {
	if (hasRequiredTemplates) return templates;
	hasRequiredTemplates = 1;
	const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
	const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
	const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
	const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

	const ESCAPES = new Map([
		['n', '\n'],
		['r', '\r'],
		['t', '\t'],
		['b', '\b'],
		['f', '\f'],
		['v', '\v'],
		['0', '\0'],
		['\\', '\\'],
		['e', '\u001B'],
		['a', '\u0007']
	]);

	function unescape(c) {
		const u = c[0] === 'u';
		const bracket = c[1] === '{';

		if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
			return String.fromCharCode(parseInt(c.slice(1), 16));
		}

		if (u && bracket) {
			return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
		}

		return ESCAPES.get(c) || c;
	}

	function parseArguments(name, arguments_) {
		const results = [];
		const chunks = arguments_.trim().split(/\s*,\s*/g);
		let matches;

		for (const chunk of chunks) {
			const number = Number(chunk);
			if (!Number.isNaN(number)) {
				results.push(number);
			} else if ((matches = chunk.match(STRING_REGEX))) {
				results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
			} else {
				throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
			}
		}

		return results;
	}

	function parseStyle(style) {
		STYLE_REGEX.lastIndex = 0;

		const results = [];
		let matches;

		while ((matches = STYLE_REGEX.exec(style)) !== null) {
			const name = matches[1];

			if (matches[2]) {
				const args = parseArguments(name, matches[2]);
				results.push([name].concat(args));
			} else {
				results.push([name]);
			}
		}

		return results;
	}

	function buildStyle(chalk, styles) {
		const enabled = {};

		for (const layer of styles) {
			for (const style of layer.styles) {
				enabled[style[0]] = layer.inverse ? null : style.slice(1);
			}
		}

		let current = chalk;
		for (const [styleName, styles] of Object.entries(enabled)) {
			if (!Array.isArray(styles)) {
				continue;
			}

			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
		}

		return current;
	}

	templates = (chalk, temporary) => {
		const styles = [];
		const chunks = [];
		let chunk = [];

		// eslint-disable-next-line max-params
		temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
			if (escapeCharacter) {
				chunk.push(unescape(escapeCharacter));
			} else if (style) {
				const string = chunk.join('');
				chunk = [];
				chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
				styles.push({inverse, styles: parseStyle(style)});
			} else if (close) {
				if (styles.length === 0) {
					throw new Error('Found extraneous } in Chalk template literal');
				}

				chunks.push(buildStyle(chalk, styles)(chunk.join('')));
				chunk = [];
				styles.pop();
			} else {
				chunk.push(character);
			}
		});

		chunks.push(chunk.join(''));

		if (styles.length > 0) {
			const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
			throw new Error(errMessage);
		}

		return chunks.join('');
	};
	return templates;
}

const ansiStyles = ansiStylesExports;
const {stdout: stdoutColor, stderr: stderrColor} = supportsColor_1;
const {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
} = util;

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = requireTemplates();
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

var source = chalk;

var chalk$1 = /*@__PURE__*/getDefaultExportFromCjs(source);

const logger = function (type,s, bold){
    let color = 'yellow';
    if(type === 'success') color = 'green';
    else if(type === 'error') color = 'red';
    const handler = bold ? chalk$1.bold[color](s) : chalk$1[color](s);
    return console.log(handler)
};
class Tool{
    constructor() {
        const _filename = url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('exec.cjs', document.baseURI).href)));
        const _dirname = path$1.dirname(_filename);
        const _root = path__namespace.join(_dirname, '..');
        this.node = {
            _filename,
            _dirname,
            _root
        };
    }
    execSync(exec){
        require$$1.execSync(exec, {stdio: 'inherit'});
    }
    getFileExt(path){
        // 使用lastIndexOf()找到最后一个'.'的位置
        const dotIndex = path.lastIndexOf('.');
        // 如果'.'不存在于路径中，则返回空字符串
        if (dotIndex === -1) throw new Error('The filepath "' + path + ' " without extension.')
        // 使用slice()方法获取从最后一个'.'到字符串末尾的部分
        return path.slice(dotIndex + 1);
    }
    success(s, bold) {
        return logger('success', s, bold)
    }
    warn(s, bold) {
        return logger('warn', s, bold)
    }
    error(s, bold) {
        return logger('error', s, bold)
    }
}

// 命令相关

class Commands {
  constructor() {
    this.main = 'dog1 ';
  }
  resolve(){
    return {
      init: {
        alias: "ini",
        description:
            "Choose multiple plugins to install and config with your node version.",
        examples: [this.main + "init"]
      },
      install: {
        alias: "i",
        description:
            "Choose single plugin to install and config with your node version.",
        examples: [
          this.main + "i <plugin-name>"
        ]
      },
      all: {
        alias: "a",
        description:
            "Quickly install all plugins and config with your node version.",
        examples: [this.main + "all"]
      },
      config: {
        alias: "conf",
        description: "Configure the cli variable. Once config, use everywhere.",
        examples: [
          this.main + "config set <k> <v>",
          this.main + "config get <k>"
        ]
      },
      "*": {
        alias: "",
        description: "Command not found.",
        examples: []
      }
    }
  }
}

var readlineSync$1 = {};

/*
 * readlineSync
 * https://github.com/anseki/readline-sync
 *
 * Copyright (c) 2019 anseki
 * Licensed under the MIT license.
 */

(function (exports) {

	var
	  IS_WIN = process.platform === 'win32',

	  ALGORITHM_CIPHER = 'aes-256-cbc',
	  ALGORITHM_HASH = 'sha256',
	  DEFAULT_ERR_MSG = 'The current environment doesn\'t support interactive reading from TTY.',

	  fs = fs$1,
	  TTY = process.binding('tty_wrap').TTY,
	  childProc = require$$1,
	  pathUtil = path$1,

	  defaultOptions = {
	    /* eslint-disable key-spacing */
	    prompt:             '> ',
	    hideEchoBack:       false,
	    mask:               '*',
	    limit:              [],
	    limitMessage:       'Input another, please.$<( [)limit(])>',
	    defaultInput:       '',
	    trueValue:          [],
	    falseValue:         [],
	    caseSensitive:      false,
	    keepWhitespace:     false,
	    encoding:           'utf8',
	    bufferSize:         1024,
	    print:              void 0,
	    history:            true,
	    cd:                 false,
	    phContent:          void 0,
	    preCheck:           void 0
	    /* eslint-enable key-spacing */
	  },

	  fdR = 'none',
	  isRawMode = false,
	  salt = 0,
	  lastInput = '',
	  inputHistory = [],
	  _DBG_useExt = false,
	  _DBG_checkOptions = false,
	  _DBG_checkMethod = false,
	  fdW, ttyR, extHostPath, extHostArgs, tempdir, rawInput;

	function getHostArgs(options) {
	  // Send any text to crazy Windows shell safely.
	  function encodeArg(arg) {
	    return arg.replace(/[^\w\u0080-\uFFFF]/g, function(chr) {
	      return '#' + chr.charCodeAt(0) + ';';
	    });
	  }

	  return extHostArgs.concat((function(conf) {
	    var args = [];
	    Object.keys(conf).forEach(function(optionName) {
	      if (conf[optionName] === 'boolean') {
	        if (options[optionName]) { args.push('--' + optionName); }
	      } else if (conf[optionName] === 'string') {
	        if (options[optionName]) {
	          args.push('--' + optionName, encodeArg(options[optionName]));
	        }
	      }
	    });
	    return args;
	  })({
	    /* eslint-disable key-spacing */
	    display:        'string',
	    displayOnly:    'boolean',
	    keyIn:          'boolean',
	    hideEchoBack:   'boolean',
	    mask:           'string',
	    limit:          'string',
	    caseSensitive:  'boolean'
	    /* eslint-enable key-spacing */
	  }));
	}

	// piping via files (for Node.js v0.10-)
	function _execFileSync(options, execOptions) {

	  function getTempfile(name) {
	    var suffix = '',
	      filepath, fd;
	    tempdir = tempdir || require$$0$1.tmpdir();

	    while (true) {
	      filepath = pathUtil.join(tempdir, name + suffix);
	      try {
	        fd = fs.openSync(filepath, 'wx');
	      } catch (e) {
	        if (e.code === 'EEXIST') {
	          suffix++;
	          continue;
	        } else {
	          throw e;
	        }
	      }
	      fs.closeSync(fd);
	      break;
	    }
	    return filepath;
	  }

	  var res = {},
	    pathStdout = getTempfile('readline-sync.stdout'),
	    pathStderr = getTempfile('readline-sync.stderr'),
	    pathExit = getTempfile('readline-sync.exit'),
	    pathDone = getTempfile('readline-sync.done'),
	    crypto = require$$4$1,
	    hostArgs, shellPath, shellArgs, exitCode, extMessage, shasum, decipher, password;

	  shasum = crypto.createHash(ALGORITHM_HASH);
	  shasum.update('' + process.pid + (salt++) + Math.random());
	  password = shasum.digest('hex');
	  decipher = crypto.createDecipher(ALGORITHM_CIPHER, password);

	  hostArgs = getHostArgs(options);
	  if (IS_WIN) {
	    shellPath = process.env.ComSpec || 'cmd.exe';
	    process.env.Q = '"'; // The quote (") that isn't escaped.
	    // `()` for ignore space by echo
	    shellArgs = ['/V:ON', '/S', '/C',
	      '(%Q%' + shellPath + '%Q% /V:ON /S /C %Q%' + /* ESLint bug? */ // eslint-disable-line no-path-concat
	        '%Q%' + extHostPath + '%Q%' +
	          hostArgs.map(function(arg) { return ' %Q%' + arg + '%Q%'; }).join('') +
	        ' & (echo !ERRORLEVEL!)>%Q%' + pathExit + '%Q%%Q%) 2>%Q%' + pathStderr + '%Q%' +
	      ' |%Q%' + process.execPath + '%Q% %Q%' + __dirname + '\\encrypt.js%Q%' +
	        ' %Q%' + ALGORITHM_CIPHER + '%Q% %Q%' + password + '%Q%' +
	        ' >%Q%' + pathStdout + '%Q%' +
	      ' & (echo 1)>%Q%' + pathDone + '%Q%'];
	  } else {
	    shellPath = '/bin/sh';
	    shellArgs = ['-c',
	      // Use `()`, not `{}` for `-c` (text param)
	      '("' + extHostPath + '"' + /* ESLint bug? */ // eslint-disable-line no-path-concat
	          hostArgs.map(function(arg) { return " '" + arg.replace(/'/g, "'\\''") + "'"; }).join('') +
	        '; echo $?>"' + pathExit + '") 2>"' + pathStderr + '"' +
	      ' |"' + process.execPath + '" "' + __dirname + '/encrypt.js"' +
	        ' "' + ALGORITHM_CIPHER + '" "' + password + '"' +
	        ' >"' + pathStdout + '"' +
	      '; echo 1 >"' + pathDone + '"'];
	  }
	  if (_DBG_checkMethod) { _DBG_checkMethod('_execFileSync', hostArgs); }
	  try {
	    childProc.spawn(shellPath, shellArgs, execOptions);
	  } catch (e) {
	    res.error = new Error(e.message);
	    res.error.method = '_execFileSync - spawn';
	    res.error.program = shellPath;
	    res.error.args = shellArgs;
	  }

	  while (fs.readFileSync(pathDone, {encoding: options.encoding}).trim() !== '1') {} // eslint-disable-line no-empty
	  if ((exitCode =
	      fs.readFileSync(pathExit, {encoding: options.encoding}).trim()) === '0') {
	    res.input =
	      decipher.update(fs.readFileSync(pathStdout, {encoding: 'binary'}),
	        'hex', options.encoding) +
	      decipher.final(options.encoding);
	  } else {
	    extMessage = fs.readFileSync(pathStderr, {encoding: options.encoding}).trim();
	    res.error = new Error(DEFAULT_ERR_MSG + (extMessage ? '\n' + extMessage : ''));
	    res.error.method = '_execFileSync';
	    res.error.program = shellPath;
	    res.error.args = shellArgs;
	    res.error.extMessage = extMessage;
	    res.error.exitCode = +exitCode;
	  }

	  fs.unlinkSync(pathStdout);
	  fs.unlinkSync(pathStderr);
	  fs.unlinkSync(pathExit);
	  fs.unlinkSync(pathDone);

	  return res;
	}

	function readlineExt(options) {
	  var res = {},
	    execOptions = {env: process.env, encoding: options.encoding},
	    hostArgs, extMessage;

	  if (!extHostPath) {
	    if (IS_WIN) {
	      if (process.env.PSModulePath) { // Windows PowerShell
	        extHostPath = 'powershell.exe';
	        extHostArgs = ['-ExecutionPolicy', 'Bypass',
	          '-File', __dirname + '\\read.ps1']; // eslint-disable-line no-path-concat
	      } else { // Windows Script Host
	        extHostPath = 'cscript.exe';
	        extHostArgs = ['//nologo', __dirname + '\\read.cs.js']; // eslint-disable-line no-path-concat
	      }
	    } else {
	      extHostPath = '/bin/sh';
	      extHostArgs = [__dirname + '/read.sh']; // eslint-disable-line no-path-concat
	    }
	  }
	  if (IS_WIN && !process.env.PSModulePath) { // Windows Script Host
	    // ScriptPW (Win XP and Server2003) needs TTY stream as STDIN.
	    // In this case, If STDIN isn't TTY, an error is thrown.
	    execOptions.stdio = [process.stdin];
	  }

	  if (childProc.execFileSync) {
	    hostArgs = getHostArgs(options);
	    if (_DBG_checkMethod) { _DBG_checkMethod('execFileSync', hostArgs); }
	    try {
	      res.input = childProc.execFileSync(extHostPath, hostArgs, execOptions);
	    } catch (e) { // non-zero exit code
	      extMessage = e.stderr ? (e.stderr + '').trim() : '';
	      res.error = new Error(DEFAULT_ERR_MSG + (extMessage ? '\n' + extMessage : ''));
	      res.error.method = 'execFileSync';
	      res.error.program = extHostPath;
	      res.error.args = hostArgs;
	      res.error.extMessage = extMessage;
	      res.error.exitCode = e.status;
	      res.error.code = e.code;
	      res.error.signal = e.signal;
	    }
	  } else {
	    res = _execFileSync(options, execOptions);
	  }
	  if (!res.error) {
	    res.input = res.input.replace(/^\s*'|'\s*$/g, '');
	    options.display = '';
	  }

	  return res;
	}

	/*
	  display:            string
	  displayOnly:        boolean
	  keyIn:              boolean
	  hideEchoBack:       boolean
	  mask:               string
	  limit:              string (pattern)
	  caseSensitive:      boolean
	  keepWhitespace:     boolean
	  encoding, bufferSize, print
	*/
	function _readlineSync(options) {
	  var input = '',
	    displaySave = options.display,
	    silent = !options.display && options.keyIn && options.hideEchoBack && !options.mask;

	  function tryExt() {
	    var res = readlineExt(options);
	    if (res.error) { throw res.error; }
	    return res.input;
	  }

	  if (_DBG_checkOptions) { _DBG_checkOptions(options); }

	  (function() { // open TTY
	    var fsB, constants, verNum;

	    function getFsB() {
	      if (!fsB) {
	        fsB = process.binding('fs'); // For raw device path
	        constants = process.binding('constants');
	        // for v6.3.0+
	        constants = constants && constants.fs && typeof constants.fs.O_RDWR === 'number'
	          ? constants.fs : constants;
	      }
	      return fsB;
	    }

	    if (typeof fdR !== 'string') { return; }
	    fdR = null;

	    if (IS_WIN) {
	      // iojs-v2.3.2+ input stream can't read first line. (#18)
	      // ** Don't get process.stdin before check! **
	      // Fixed v5.1.0
	      // Fixed v4.2.4
	      // It regressed again in v5.6.0, it is fixed in v6.2.0.
	      verNum = (function(ver) { // getVerNum
	        var nums = ver.replace(/^\D+/, '').split('.');
	        var verNum = 0;
	        if ((nums[0] = +nums[0])) { verNum += nums[0] * 10000; }
	        if ((nums[1] = +nums[1])) { verNum += nums[1] * 100; }
	        if ((nums[2] = +nums[2])) { verNum += nums[2]; }
	        return verNum;
	      })(process.version);
	      if (!(verNum >= 20302 && verNum < 40204 || verNum >= 50000 && verNum < 50100 || verNum >= 50600 && verNum < 60200) &&
	          process.stdin.isTTY) {
	        process.stdin.pause();
	        fdR = process.stdin.fd;
	        ttyR = process.stdin._handle;
	      } else {
	        try {
	          // The stream by fs.openSync('\\\\.\\CON', 'r') can't switch to raw mode.
	          // 'CONIN$' might fail on XP, 2000, 7 (x86).
	          fdR = getFsB().open('CONIN$', constants.O_RDWR, parseInt('0666', 8));
	          ttyR = new TTY(fdR, true);
	        } catch (e) { /* ignore */ }
	      }

	      if (process.stdout.isTTY) {
	        fdW = process.stdout.fd;
	      } else {
	        try {
	          fdW = fs.openSync('\\\\.\\CON', 'w');
	        } catch (e) { /* ignore */ }
	        if (typeof fdW !== 'number') { // Retry
	          try {
	            fdW = getFsB().open('CONOUT$', constants.O_RDWR, parseInt('0666', 8));
	          } catch (e) { /* ignore */ }
	        }
	      }

	    } else {
	      if (process.stdin.isTTY) {
	        process.stdin.pause();
	        try {
	          fdR = fs.openSync('/dev/tty', 'r'); // device file, not process.stdin
	          ttyR = process.stdin._handle;
	        } catch (e) { /* ignore */ }
	      } else {
	        // Node.js v0.12 read() fails.
	        try {
	          fdR = fs.openSync('/dev/tty', 'r');
	          ttyR = new TTY(fdR, false);
	        } catch (e) { /* ignore */ }
	      }

	      if (process.stdout.isTTY) {
	        fdW = process.stdout.fd;
	      } else {
	        try {
	          fdW = fs.openSync('/dev/tty', 'w');
	        } catch (e) { /* ignore */ }
	      }
	    }
	  })();

	  (function() { // try read
	    var isCooked = !options.hideEchoBack && !options.keyIn,
	      atEol, limit, buffer, reqSize, readSize, chunk, line;
	    rawInput = '';

	    // Node.js v0.10- returns an error if same mode is set.
	    function setRawMode(mode) {
	      if (mode === isRawMode) { return true; }
	      if (ttyR.setRawMode(mode) !== 0) { return false; }
	      isRawMode = mode;
	      return true;
	    }

	    if (_DBG_useExt || !ttyR ||
	        typeof fdW !== 'number' && (options.display || !isCooked)) {
	      input = tryExt();
	      return;
	    }

	    if (options.display) {
	      fs.writeSync(fdW, options.display);
	      options.display = '';
	    }
	    if (options.displayOnly) { return; }

	    if (!setRawMode(!isCooked)) {
	      input = tryExt();
	      return;
	    }

	    reqSize = options.keyIn ? 1 : options.bufferSize;
	    // Check `allocUnsafe` to make sure of the new API.
	    buffer = Buffer.allocUnsafe && Buffer.alloc ? Buffer.alloc(reqSize) : new Buffer(reqSize);

	    if (options.keyIn && options.limit) {
	      limit = new RegExp('[^' + options.limit + ']',
	        'g' + (options.caseSensitive ? '' : 'i'));
	    }

	    while (true) {
	      readSize = 0;
	      try {
	        readSize = fs.readSync(fdR, buffer, 0, reqSize);
	      } catch (e) {
	        if (e.code !== 'EOF') {
	          setRawMode(false);
	          input += tryExt();
	          return;
	        }
	      }
	      if (readSize > 0) {
	        chunk = buffer.toString(options.encoding, 0, readSize);
	        rawInput += chunk;
	      } else {
	        chunk = '\n';
	        rawInput += String.fromCharCode(0);
	      }

	      if (chunk && typeof (line = (chunk.match(/^(.*?)[\r\n]/) || [])[1]) === 'string') {
	        chunk = line;
	        atEol = true;
	      }

	      // other ctrl-chars
	      // eslint-disable-next-line no-control-regex
	      if (chunk) { chunk = chunk.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ''); }
	      if (chunk && limit) { chunk = chunk.replace(limit, ''); }

	      if (chunk) {
	        if (!isCooked) {
	          if (!options.hideEchoBack) {
	            fs.writeSync(fdW, chunk);
	          } else if (options.mask) {
	            fs.writeSync(fdW, (new Array(chunk.length + 1)).join(options.mask));
	          }
	        }
	        input += chunk;
	      }

	      if (!options.keyIn && atEol ||
	        options.keyIn && input.length >= reqSize) { break; }
	    }

	    if (!isCooked && !silent) { fs.writeSync(fdW, '\n'); }
	    setRawMode(false);
	  })();

	  if (options.print && !silent) {
	    options.print(
	      displaySave + (
	        options.displayOnly ? '' : (
	          options.hideEchoBack ? (new Array(input.length + 1)).join(options.mask) : input
	        ) + '\n' // must at least write '\n'
	      ),
	      options.encoding);
	  }

	  return options.displayOnly ? '' :
	    (lastInput = options.keepWhitespace || options.keyIn ? input : input.trim());
	}

	function flattenArray(array, validator) {
	  var flatArray = [];
	  function _flattenArray(array) {
	    if (array == null) { return; }
	    if (Array.isArray(array)) {
	      array.forEach(_flattenArray);
	    } else if (!validator || validator(array)) {
	      flatArray.push(array);
	    }
	  }
	  _flattenArray(array);
	  return flatArray;
	}

	function escapePattern(pattern) {
	  return pattern.replace(/[\x00-\x7f]/g, // eslint-disable-line no-control-regex
	    function(s) { return '\\x' + ('00' + s.charCodeAt().toString(16)).substr(-2); });
	}

	// margeOptions(options1, options2 ... )
	// margeOptions(true, options1, options2 ... )
	//    arg1=true : Start from defaultOptions and pick elements of that.
	function margeOptions() {
	  var optionsList = Array.prototype.slice.call(arguments),
	    optionNames, fromDefault;

	  if (optionsList.length && typeof optionsList[0] === 'boolean') {
	    fromDefault = optionsList.shift();
	    if (fromDefault) {
	      optionNames = Object.keys(defaultOptions);
	      optionsList.unshift(defaultOptions);
	    }
	  }

	  return optionsList.reduce(function(options, optionsPart) {
	    if (optionsPart == null) { return options; }

	    // ======== DEPRECATED ========
	    if (optionsPart.hasOwnProperty('noEchoBack') &&
	        !optionsPart.hasOwnProperty('hideEchoBack')) {
	      optionsPart.hideEchoBack = optionsPart.noEchoBack;
	      delete optionsPart.noEchoBack;
	    }
	    if (optionsPart.hasOwnProperty('noTrim') &&
	        !optionsPart.hasOwnProperty('keepWhitespace')) {
	      optionsPart.keepWhitespace = optionsPart.noTrim;
	      delete optionsPart.noTrim;
	    }
	    // ======== /DEPRECATED ========

	    if (!fromDefault) { optionNames = Object.keys(optionsPart); }
	    optionNames.forEach(function(optionName) {
	      var value;
	      if (!optionsPart.hasOwnProperty(optionName)) { return; }
	      value = optionsPart[optionName];
	      /* eslint-disable no-multi-spaces */
	      switch (optionName) {
	        //                    _readlineSync <- *    * -> defaultOptions
	        // ================ string
	        case 'mask':                        // *    *
	        case 'limitMessage':                //      *
	        case 'defaultInput':                //      *
	        case 'encoding':                    // *    *
	          value = value != null ? value + '' : '';
	          if (value && optionName !== 'limitMessage') { value = value.replace(/[\r\n]/g, ''); }
	          options[optionName] = value;
	          break;
	        // ================ number(int)
	        case 'bufferSize':                  // *    *
	          if (!isNaN(value = parseInt(value, 10)) && typeof value === 'number') {
	            options[optionName] = value; // limited updating (number is needed)
	          }
	          break;
	        // ================ boolean
	        case 'displayOnly':                 // *
	        case 'keyIn':                       // *
	        case 'hideEchoBack':                // *    *
	        case 'caseSensitive':               // *    *
	        case 'keepWhitespace':              // *    *
	        case 'history':                     //      *
	        case 'cd':                          //      *
	          options[optionName] = !!value;
	          break;
	        // ================ array
	        case 'limit':                       // *    *     to string for readlineExt
	        case 'trueValue':                   //      *
	        case 'falseValue':                  //      *
	          options[optionName] = flattenArray(value, function(value) {
	            var type = typeof value;
	            return type === 'string' || type === 'number' ||
	              type === 'function' || value instanceof RegExp;
	          }).map(function(value) {
	            return typeof value === 'string' ? value.replace(/[\r\n]/g, '') : value;
	          });
	          break;
	        // ================ function
	        case 'print':                       // *    *
	        case 'phContent':                   //      *
	        case 'preCheck':                    //      *
	          options[optionName] = typeof value === 'function' ? value : void 0;
	          break;
	        // ================ other
	        case 'prompt':                      //      *
	        case 'display':                     // *
	          options[optionName] = value != null ? value : '';
	          break;
	        // no default
	      }
	      /* eslint-enable no-multi-spaces */
	    });
	    return options;
	  }, {});
	}

	function isMatched(res, comps, caseSensitive) {
	  return comps.some(function(comp) {
	    var type = typeof comp;
	    return type === 'string'
	      ? (caseSensitive ? res === comp : res.toLowerCase() === comp.toLowerCase()) :
	      type === 'number' ? parseFloat(res) === comp :
	      type === 'function' ? comp(res) :
	      comp instanceof RegExp ? comp.test(res) : false;
	  });
	}

	function replaceHomePath(path, expand) {
	  var homePath = pathUtil.normalize(
	    IS_WIN ? (process.env.HOMEDRIVE || '') + (process.env.HOMEPATH || '') :
	    process.env.HOME || '').replace(/[/\\]+$/, '');
	  path = pathUtil.normalize(path);
	  return expand ? path.replace(/^~(?=\/|\\|$)/, homePath) :
	    path.replace(new RegExp('^' + escapePattern(homePath) +
	      '(?=\\/|\\\\|$)', IS_WIN ? 'i' : ''), '~');
	}

	function replacePlaceholder(text, generator) {
	  var PTN_INNER = '(?:\\(([\\s\\S]*?)\\))?(\\w+|.-.)(?:\\(([\\s\\S]*?)\\))?',
	    rePlaceholder = new RegExp('(\\$)?(\\$<' + PTN_INNER + '>)', 'g'),
	    rePlaceholderCompat = new RegExp('(\\$)?(\\$\\{' + PTN_INNER + '\\})', 'g');

	  function getPlaceholderText(s, escape, placeholder, pre, param, post) {
	    var text;
	    return escape || typeof (text = generator(param)) !== 'string' ? placeholder :
	      text ? (pre || '') + text + (post || '') : '';
	  }

	  return text.replace(rePlaceholder, getPlaceholderText)
	    .replace(rePlaceholderCompat, getPlaceholderText);
	}

	function array2charlist(array, caseSensitive, collectSymbols) {
	  var group = [],
	    groupClass = -1,
	    charCode = 0,
	    symbols = '',
	    values, suppressed;
	  function addGroup(groups, group) {
	    if (group.length > 3) { // ellipsis
	      groups.push(group[0] + '...' + group[group.length - 1]);
	      suppressed = true;
	    } else if (group.length) {
	      groups = groups.concat(group);
	    }
	    return groups;
	  }

	  values = array.reduce(function(chars, value) {
	    return chars.concat((value + '').split(''));
	  }, []).reduce(function(groups, curChar) {
	    var curGroupClass, curCharCode;
	    if (!caseSensitive) { curChar = curChar.toLowerCase(); }
	    curGroupClass = /^\d$/.test(curChar) ? 1 :
	      /^[A-Z]$/.test(curChar) ? 2 : /^[a-z]$/.test(curChar) ? 3 : 0;
	    if (collectSymbols && curGroupClass === 0) {
	      symbols += curChar;
	    } else {
	      curCharCode = curChar.charCodeAt(0);
	      if (curGroupClass && curGroupClass === groupClass &&
	          curCharCode === charCode + 1) {
	        group.push(curChar);
	      } else {
	        groups = addGroup(groups, group);
	        group = [curChar];
	        groupClass = curGroupClass;
	      }
	      charCode = curCharCode;
	    }
	    return groups;
	  }, []);
	  values = addGroup(values, group); // last group
	  if (symbols) { values.push(symbols); suppressed = true; }
	  return {values: values, suppressed: suppressed};
	}

	function joinChunks(chunks, suppressed) {
	  return chunks.join(chunks.length > 2 ? ', ' : suppressed ? ' / ' : '/');
	}

	function getPhContent(param, options) {
	  var resCharlist = {},
	    text, values, arg;
	  if (options.phContent) {
	    text = options.phContent(param, options);
	  }
	  if (typeof text !== 'string') {
	    switch (param) {
	      case 'hideEchoBack':
	      case 'mask':
	      case 'defaultInput':
	      case 'caseSensitive':
	      case 'keepWhitespace':
	      case 'encoding':
	      case 'bufferSize':
	      case 'history':
	      case 'cd':
	        text = !options.hasOwnProperty(param) ? '' :
	          typeof options[param] === 'boolean' ? (options[param] ? 'on' : 'off') :
	          options[param] + '';
	        break;
	      // case 'prompt':
	      // case 'query':
	      // case 'display':
	      //   text = options.hasOwnProperty('displaySrc') ? options.displaySrc + '' : '';
	      //   break;
	      case 'limit':
	      case 'trueValue':
	      case 'falseValue':
	        values = options[options.hasOwnProperty(param + 'Src') ? param + 'Src' : param];
	        if (options.keyIn) { // suppress
	          resCharlist = array2charlist(values, options.caseSensitive);
	          values = resCharlist.values;
	        } else {
	          values = values.filter(function(value) {
	            var type = typeof value;
	            return type === 'string' || type === 'number';
	          });
	        }
	        text = joinChunks(values, resCharlist.suppressed);
	        break;
	      case 'limitCount':
	      case 'limitCountNotZero':
	        text = options[options.hasOwnProperty('limitSrc') ? 'limitSrc' : 'limit'].length;
	        text = text || param !== 'limitCountNotZero' ? text + '' : '';
	        break;
	      case 'lastInput':
	        text = lastInput;
	        break;
	      case 'cwd':
	      case 'CWD':
	      case 'cwdHome':
	        text = process.cwd();
	        if (param === 'CWD') {
	          text = pathUtil.basename(text);
	        } else if (param === 'cwdHome') {
	          text = replaceHomePath(text);
	        }
	        break;
	      case 'date':
	      case 'time':
	      case 'localeDate':
	      case 'localeTime':
	        text = (new Date())['to' +
	          param.replace(/^./, function(str) { return str.toUpperCase(); }) +
	          'String']();
	        break;
	      default: // with arg
	        if (typeof (arg = (param.match(/^history_m(\d+)$/) || [])[1]) === 'string') {
	          text = inputHistory[inputHistory.length - arg] || '';
	        }
	    }
	  }
	  return text;
	}

	function getPhCharlist(param) {
	  var matches = /^(.)-(.)$/.exec(param),
	    text = '',
	    from, to, code, step;
	  if (!matches) { return null; }
	  from = matches[1].charCodeAt(0);
	  to = matches[2].charCodeAt(0);
	  step = from < to ? 1 : -1;
	  for (code = from; code !== to + step; code += step) { text += String.fromCharCode(code); }
	  return text;
	}

	// cmd "arg" " a r g " "" 'a"r"g' "a""rg" "arg
	function parseCl(cl) {
	  var reToken = new RegExp(/(\s*)(?:("|')(.*?)(?:\2|$)|(\S+))/g),
	    taken = '',
	    args = [],
	    matches, part;
	  cl = cl.trim();
	  while ((matches = reToken.exec(cl))) {
	    part = matches[3] || matches[4] || '';
	    if (matches[1]) {
	      args.push(taken);
	      taken = '';
	    }
	    taken += part;
	  }
	  if (taken) { args.push(taken); }
	  return args;
	}

	function toBool(res, options) {
	  return (
	    (options.trueValue.length &&
	      isMatched(res, options.trueValue, options.caseSensitive)) ? true :
	    (options.falseValue.length &&
	      isMatched(res, options.falseValue, options.caseSensitive)) ? false : res);
	}

	function getValidLine(options) {
	  var res, forceNext, limitMessage,
	    matches, histInput, args, resCheck;

	  function _getPhContent(param) { return getPhContent(param, options); }
	  function addDisplay(text) { options.display += (/[^\r\n]$/.test(options.display) ? '\n' : '') + text; }

	  options.limitSrc = options.limit;
	  options.displaySrc = options.display;
	  options.limit = ''; // for readlineExt
	  options.display = replacePlaceholder(options.display + '', _getPhContent);

	  while (true) {
	    res = _readlineSync(options);
	    forceNext = false;
	    limitMessage = '';

	    if (options.defaultInput && !res) { res = options.defaultInput; }

	    if (options.history) {
	      if ((matches = /^\s*!(?:!|-1)(:p)?\s*$/.exec(res))) { // `!!` `!-1` +`:p`
	        histInput = inputHistory[0] || '';
	        if (matches[1]) { // only display
	          forceNext = true;
	        } else { // replace input
	          res = histInput;
	        }
	        // Show it even if it is empty (NL only).
	        addDisplay(histInput + '\n');
	        if (!forceNext) { // Loop may break
	          options.displayOnly = true;
	          _readlineSync(options);
	          options.displayOnly = false;
	        }
	      } else if (res && res !== inputHistory[inputHistory.length - 1]) {
	        inputHistory = [res];
	      }
	    }

	    if (!forceNext && options.cd && res) {
	      args = parseCl(res);
	      switch (args[0].toLowerCase()) {
	        case 'cd':
	          if (args[1]) {
	            try {
	              process.chdir(replaceHomePath(args[1], true));
	            } catch (e) {
	              addDisplay(e + '');
	            }
	          }
	          forceNext = true;
	          break;
	        case 'pwd':
	          addDisplay(process.cwd());
	          forceNext = true;
	          break;
	        // no default
	      }
	    }

	    if (!forceNext && options.preCheck) {
	      resCheck = options.preCheck(res, options);
	      res = resCheck.res;
	      if (resCheck.forceNext) { forceNext = true; } // Don't switch to false.
	    }

	    if (!forceNext) {
	      if (!options.limitSrc.length ||
	        isMatched(res, options.limitSrc, options.caseSensitive)) { break; }
	      if (options.limitMessage) {
	        limitMessage = replacePlaceholder(options.limitMessage, _getPhContent);
	      }
	    }

	    addDisplay((limitMessage ? limitMessage + '\n' : '') +
	      replacePlaceholder(options.displaySrc + '', _getPhContent));
	  }
	  return toBool(res, options);
	}

	// for dev
	exports._DBG_set_useExt = function(val) { _DBG_useExt = val; };
	exports._DBG_set_checkOptions = function(val) { _DBG_checkOptions = val; };
	exports._DBG_set_checkMethod = function(val) { _DBG_checkMethod = val; };
	exports._DBG_clearHistory = function() { lastInput = ''; inputHistory = []; };

	// ------------------------------------

	exports.setDefaultOptions = function(options) {
	  defaultOptions = margeOptions(true, options);
	  return margeOptions(true); // copy
	};

	exports.question = function(query, options) {
	  /* eslint-disable key-spacing */
	  return getValidLine(margeOptions(margeOptions(true, options), {
	    display:            query
	  }));
	  /* eslint-enable key-spacing */
	};

	exports.prompt = function(options) {
	  var readOptions = margeOptions(true, options);
	  readOptions.display = readOptions.prompt;
	  return getValidLine(readOptions);
	};

	exports.keyIn = function(query, options) {
	  /* eslint-disable key-spacing */
	  var readOptions = margeOptions(margeOptions(true, options), {
	    display:            query,
	    keyIn:              true,
	    keepWhitespace:     true
	  });
	  /* eslint-enable key-spacing */

	  // char list
	  readOptions.limitSrc = readOptions.limit.filter(function(value) {
	    var type = typeof value;
	    return type === 'string' || type === 'number';
	  }).map(function(text) {
	    return replacePlaceholder(text + '', getPhCharlist);
	  });
	  // pattern
	  readOptions.limit = escapePattern(readOptions.limitSrc.join(''));

	  ['trueValue', 'falseValue'].forEach(function(optionName) {
	    readOptions[optionName] = readOptions[optionName].reduce(function(comps, comp) {
	      var type = typeof comp;
	      if (type === 'string' || type === 'number') {
	        comps = comps.concat((comp + '').split(''));
	      } else { comps.push(comp); }
	      return comps;
	    }, []);
	  });

	  readOptions.display = replacePlaceholder(readOptions.display + '',
	    function(param) { return getPhContent(param, readOptions); });

	  return toBool(_readlineSync(readOptions), readOptions);
	};

	// ------------------------------------

	exports.questionEMail = function(query, options) {
	  if (query == null) { query = 'Input e-mail address: '; }
	  /* eslint-disable key-spacing */
	  return exports.question(query, margeOptions({
	    // -------- default
	    hideEchoBack:       false,
	    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
	    limit:              /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
	    limitMessage:       'Input valid e-mail address, please.',
	    trueValue:          null,
	    falseValue:         null
	  }, options, {
	    // -------- forced
	    keepWhitespace:     false,
	    cd:                 false
	  }));
	  /* eslint-enable key-spacing */
	};

	exports.questionNewPassword = function(query, options) {
	  /* eslint-disable key-spacing */
	  var resCharlist, min, max,
	    readOptions = margeOptions({
	      // -------- default
	      hideEchoBack:       true,
	      mask:               '*',
	      limitMessage:       'It can include: $<charlist>\n' +
	                            'And the length must be: $<length>',
	      trueValue:          null,
	      falseValue:         null,
	      caseSensitive:      true
	    }, options, {
	      // -------- forced
	      history:            false,
	      cd:                 false,
	      // limit (by charlist etc.),
	      phContent: function(param) {
	        return param === 'charlist' ? resCharlist.text :
	          param === 'length' ? min + '...' + max : null;
	      }
	    }),
	    // added:     charlist, min, max, confirmMessage, unmatchMessage
	    charlist, confirmMessage, unmatchMessage,
	    limit, limitMessage, res1, res2;
	  /* eslint-enable key-spacing */
	  options = options || {};

	  charlist = replacePlaceholder(
	    options.charlist ? options.charlist + '' : '$<!-~>', getPhCharlist);
	  if (isNaN(min = parseInt(options.min, 10)) || typeof min !== 'number') { min = 12; }
	  if (isNaN(max = parseInt(options.max, 10)) || typeof max !== 'number') { max = 24; }
	  limit = new RegExp('^[' + escapePattern(charlist) +
	    ']{' + min + ',' + max + '}$');
	  resCharlist = array2charlist([charlist], readOptions.caseSensitive, true);
	  resCharlist.text = joinChunks(resCharlist.values, resCharlist.suppressed);

	  confirmMessage = options.confirmMessage != null ? options.confirmMessage :
	    'Reinput a same one to confirm it: ';
	  unmatchMessage = options.unmatchMessage != null ? options.unmatchMessage :
	    'It differs from first one.' +
	      ' Hit only the Enter key if you want to retry from first one.';

	  if (query == null) { query = 'Input new password: '; }

	  limitMessage = readOptions.limitMessage;
	  while (!res2) {
	    readOptions.limit = limit;
	    readOptions.limitMessage = limitMessage;
	    res1 = exports.question(query, readOptions);

	    readOptions.limit = [res1, ''];
	    readOptions.limitMessage = unmatchMessage;
	    res2 = exports.question(confirmMessage, readOptions);
	  }

	  return res1;
	};

	function _questionNum(query, options, parser) {
	  var validValue;
	  function getValidValue(value) {
	    validValue = parser(value);
	    return !isNaN(validValue) && typeof validValue === 'number';
	  }
	  /* eslint-disable key-spacing */
	  exports.question(query, margeOptions({
	    // -------- default
	    limitMessage:       'Input valid number, please.'
	  }, options, {
	    // -------- forced
	    limit:              getValidValue,
	    cd:                 false
	    // trueValue, falseValue, caseSensitive, keepWhitespace don't work.
	  }));
	  /* eslint-enable key-spacing */
	  return validValue;
	}
	exports.questionInt = function(query, options) {
	  return _questionNum(query, options, function(value) { return parseInt(value, 10); });
	};
	exports.questionFloat = function(query, options) {
	  return _questionNum(query, options, parseFloat);
	};

	exports.questionPath = function(query, options) {
	  /* eslint-disable key-spacing */
	  var error = '',
	    validPath, // before readOptions
	    readOptions = margeOptions({
	      // -------- default
	      hideEchoBack:       false,
	      limitMessage:       '$<error(\n)>Input valid path, please.' +
	                            '$<( Min:)min>$<( Max:)max>',
	      history:            true,
	      cd:                 true
	    }, options, {
	      // -------- forced
	      keepWhitespace:     false,
	      limit: function(value) {
	        var exists, stat, res;
	        value = replaceHomePath(value, true);
	        error = ''; // for validate
	        // mkdir -p
	        function mkdirParents(dirPath) {
	          dirPath.split(/\/|\\/).reduce(function(parents, dir) {
	            var path = pathUtil.resolve((parents += dir + pathUtil.sep));
	            if (!fs.existsSync(path)) {
	              fs.mkdirSync(path);
	            } else if (!fs.statSync(path).isDirectory()) {
	              throw new Error('Non directory already exists: ' + path);
	            }
	            return parents;
	          }, '');
	        }

	        try {
	          exists = fs.existsSync(value);
	          validPath = exists ? fs.realpathSync(value) : pathUtil.resolve(value);
	          // options.exists default: true, not-bool: no-check
	          if (!options.hasOwnProperty('exists') && !exists ||
	              typeof options.exists === 'boolean' && options.exists !== exists) {
	            error = (exists ? 'Already exists' : 'No such file or directory') +
	              ': ' + validPath;
	            return false;
	          }
	          if (!exists && options.create) {
	            if (options.isDirectory) {
	              mkdirParents(validPath);
	            } else {
	              mkdirParents(pathUtil.dirname(validPath));
	              fs.closeSync(fs.openSync(validPath, 'w')); // touch
	            }
	            validPath = fs.realpathSync(validPath);
	          }
	          if (exists && (options.min || options.max ||
	              options.isFile || options.isDirectory)) {
	            stat = fs.statSync(validPath);
	            // type check first (directory has zero size)
	            if (options.isFile && !stat.isFile()) {
	              error = 'Not file: ' + validPath;
	              return false;
	            } else if (options.isDirectory && !stat.isDirectory()) {
	              error = 'Not directory: ' + validPath;
	              return false;
	            } else if (options.min && stat.size < +options.min ||
	                options.max && stat.size > +options.max) {
	              error = 'Size ' + stat.size + ' is out of range: ' + validPath;
	              return false;
	            }
	          }
	          if (typeof options.validate === 'function' &&
	              (res = options.validate(validPath)) !== true) {
	            if (typeof res === 'string') { error = res; }
	            return false;
	          }
	        } catch (e) {
	          error = e + '';
	          return false;
	        }
	        return true;
	      },
	      // trueValue, falseValue, caseSensitive don't work.
	      phContent: function(param) {
	        return param === 'error' ? error :
	          param !== 'min' && param !== 'max' ? null :
	          options.hasOwnProperty(param) ? options[param] + '' : '';
	      }
	    });
	    // added:     exists, create, min, max, isFile, isDirectory, validate
	  /* eslint-enable key-spacing */
	  options = options || {};

	  if (query == null) { query = 'Input path (you can "cd" and "pwd"): '; }

	  exports.question(query, readOptions);
	  return validPath;
	};

	// props: preCheck, args, hRes, limit
	function getClHandler(commandHandler, options) {
	  var clHandler = {},
	    hIndex = {};
	  if (typeof commandHandler === 'object') {
	    Object.keys(commandHandler).forEach(function(cmd) {
	      if (typeof commandHandler[cmd] === 'function') {
	        hIndex[options.caseSensitive ? cmd : cmd.toLowerCase()] = commandHandler[cmd];
	      }
	    });
	    clHandler.preCheck = function(res) {
	      var cmdKey;
	      clHandler.args = parseCl(res);
	      cmdKey = clHandler.args[0] || '';
	      if (!options.caseSensitive) { cmdKey = cmdKey.toLowerCase(); }
	      clHandler.hRes =
	        cmdKey !== '_' && hIndex.hasOwnProperty(cmdKey)
	          ? hIndex[cmdKey].apply(res, clHandler.args.slice(1)) :
	          hIndex.hasOwnProperty('_') ? hIndex._.apply(res, clHandler.args) : null;
	      return {res: res, forceNext: false};
	    };
	    if (!hIndex.hasOwnProperty('_')) {
	      clHandler.limit = function() { // It's called after preCheck.
	        var cmdKey = clHandler.args[0] || '';
	        if (!options.caseSensitive) { cmdKey = cmdKey.toLowerCase(); }
	        return hIndex.hasOwnProperty(cmdKey);
	      };
	    }
	  } else {
	    clHandler.preCheck = function(res) {
	      clHandler.args = parseCl(res);
	      clHandler.hRes = typeof commandHandler === 'function'
	        ? commandHandler.apply(res, clHandler.args) : true; // true for break loop
	      return {res: res, forceNext: false};
	    };
	  }
	  return clHandler;
	}

	exports.promptCL = function(commandHandler, options) {
	  /* eslint-disable key-spacing */
	  var readOptions = margeOptions({
	      // -------- default
	      hideEchoBack:       false,
	      limitMessage:       'Requested command is not available.',
	      caseSensitive:      false,
	      history:            true
	    }, options),
	    //   -------- forced
	    //   trueValue, falseValue, keepWhitespace don't work.
	    //   preCheck, limit (by clHandler)
	    clHandler = getClHandler(commandHandler, readOptions);
	  /* eslint-enable key-spacing */
	  readOptions.limit = clHandler.limit;
	  readOptions.preCheck = clHandler.preCheck;
	  exports.prompt(readOptions);
	  return clHandler.args;
	};

	exports.promptLoop = function(inputHandler, options) {
	  /* eslint-disable key-spacing */
	  var readOptions = margeOptions({
	    // -------- default
	    hideEchoBack:       false,
	    trueValue:          null,
	    falseValue:         null,
	    caseSensitive:      false,
	    history:            true
	  }, options);
	  /* eslint-enable key-spacing */
	  while (true) { if (inputHandler(exports.prompt(readOptions))) { break; } }
	  // return; // nothing is returned
	};

	exports.promptCLLoop = function(commandHandler, options) {
	  /* eslint-disable key-spacing */
	  var readOptions = margeOptions({
	      // -------- default
	      hideEchoBack:       false,
	      limitMessage:       'Requested command is not available.',
	      caseSensitive:      false,
	      history:            true
	    }, options),
	    //   -------- forced
	    //   trueValue, falseValue, keepWhitespace don't work.
	    //   preCheck, limit (by clHandler)
	    clHandler = getClHandler(commandHandler, readOptions);
	  /* eslint-enable key-spacing */
	  readOptions.limit = clHandler.limit;
	  readOptions.preCheck = clHandler.preCheck;
	  while (true) {
	    exports.prompt(readOptions);
	    if (clHandler.hRes) { break; }
	  }
	  // return; // nothing is returned
	};

	exports.promptSimShell = function(options) {
	  /* eslint-disable key-spacing */
	  return exports.prompt(margeOptions({
	    // -------- default
	    hideEchoBack:       false,
	    history:            true
	  }, options, {
	    // -------- forced
	    prompt:             (function() {
	      return IS_WIN ? '$<cwd>>' :
	        // 'user@host:cwd$ '
	        (process.env.USER || '') +
	        (process.env.HOSTNAME ? '@' + process.env.HOSTNAME.replace(/\..*$/, '') : '') +
	        ':$<cwdHome>$ ';
	    })()
	  }));
	  /* eslint-enable key-spacing */
	};

	function _keyInYN(query, options, limit) {
	  var res;
	  if (query == null) { query = 'Are you sure? '; }
	  if ((!options || options.guide !== false) && (query += '')) {
	    query = query.replace(/\s*:?\s*$/, '') + ' [y/n]: ';
	  }
	  /* eslint-disable key-spacing */
	  res = exports.keyIn(query, margeOptions(options, {
	    // -------- forced
	    hideEchoBack:       false,
	    limit:              limit,
	    trueValue:          'y',
	    falseValue:         'n',
	    caseSensitive:      false
	    // mask doesn't work.
	  }));
	  // added:     guide
	  /* eslint-enable key-spacing */
	  return typeof res === 'boolean' ? res : '';
	}
	exports.keyInYN = function(query, options) { return _keyInYN(query, options); };
	exports.keyInYNStrict = function(query, options) { return _keyInYN(query, options, 'yn'); };

	exports.keyInPause = function(query, options) {
	  if (query == null) { query = 'Continue...'; }
	  if ((!options || options.guide !== false) && (query += '')) {
	    query = query.replace(/\s+$/, '') + ' (Hit any key)';
	  }
	  /* eslint-disable key-spacing */
	  exports.keyIn(query, margeOptions({
	    // -------- default
	    limit:              null
	  }, options, {
	    // -------- forced
	    hideEchoBack:       true,
	    mask:               ''
	  }));
	  // added:     guide
	  /* eslint-enable key-spacing */
	  // return; // nothing is returned
	};

	exports.keyInSelect = function(items, query, options) {
	  /* eslint-disable key-spacing */
	  var readOptions = margeOptions({
	      // -------- default
	      hideEchoBack:       false
	    }, options, {
	      // -------- forced
	      trueValue:          null,
	      falseValue:         null,
	      caseSensitive:      false,
	      // limit (by items),
	      phContent: function(param) {
	        return param === 'itemsCount' ? items.length + '' :
	          param === 'firstItem' ? (items[0] + '').trim() :
	          param === 'lastItem' ? (items[items.length - 1] + '').trim() : null;
	      }
	    }),
	    // added:     guide, cancel
	    keylist = '',
	    key2i = {},
	    charCode = 49 /* '1' */,
	    display = '\n';
	  /* eslint-enable key-spacing */
	  if (!Array.isArray(items) || !items.length || items.length > 35) {
	    throw '`items` must be Array (max length: 35).';
	  }

	  items.forEach(function(item, i) {
	    var key = String.fromCharCode(charCode);
	    keylist += key;
	    key2i[key] = i;
	    display += '[' + key + '] ' + (item + '').trim() + '\n';
	    charCode = charCode === 57 /* '9' */ ? 97 /* 'a' */ : charCode + 1;
	  });
	  if (!options || options.cancel !== false) {
	    keylist += '0';
	    key2i['0'] = -1;
	    display += '[0] ' +
	      (options && options.cancel != null && typeof options.cancel !== 'boolean'
	        ? (options.cancel + '').trim() : 'CANCEL') + '\n';
	  }
	  readOptions.limit = keylist;
	  display += '\n';

	  if (query == null) { query = 'Choose one from list: '; }
	  if ((query += '')) {
	    if (!options || options.guide !== false) {
	      query = query.replace(/\s*:?\s*$/, '') + ' [$<limit>]: ';
	    }
	    display += query;
	  }

	  return key2i[exports.keyIn(display, readOptions).toLowerCase()];
	};

	exports.getRawInput = function() { return rawInput; };

	// ======== DEPRECATED ========
	function _setOption(optionName, args) {
	  var options;
	  if (args.length) { options = {}; options[optionName] = args[0]; }
	  return exports.setDefaultOptions(options)[optionName];
	}
	exports.setPrint = function() { return _setOption('print', arguments); };
	exports.setPrompt = function() { return _setOption('prompt', arguments); };
	exports.setEncoding = function() { return _setOption('encoding', arguments); };
	exports.setMask = function() { return _setOption('mask', arguments); };
	exports.setBufferSize = function() { return _setOption('bufferSize', arguments); }; 
} (readlineSync$1));

var readlineSync = /*@__PURE__*/getDefaultExportFromCjs(readlineSync$1);

// 用户的package.json
class Pkg{
    constructor() {
        const dirPath = process.cwd(); // 用户根路径
        this.path = path$1.join( dirPath, 'package.json');
        this.dirPath = dirPath;
    }
    get(){
        try {
            if(!fs$1.existsSync(this.path)) throw new Error('Error package.json path')
            let info = JSON.parse(fs$1.readFileSync(this.path, 'utf-8'));
            function isObject (obj){
               return  Object.prototype.toString.call(obj) === '[object Object]'
            }
            // 如果阅读的过程中，防止用户删除pkg, 如果不为对象设为{}
            !isObject(info) || !isObject(info.script) && (info = {script : {}});
            this.update(info);
            return info
        }catch (e){
            throw new Error('Error: '+e)
        }
    }
    update(content){
        this.get(this.path); // 确保文件存在
        fs$1.writeFileSync(this.path, JSON.stringify(content, null, 2));
    }
}

const tool = new Tool();
class Installer {
    constructor(installs) {
        // 需要一个packageManger工具
        this.mgr = 'pnpm';
        this.pkg = new Pkg();
        this.pre(installs);
    }
    checkGit(dirPath){
        const gitPath = path$1.join(dirPath, '.git');
        if(!gitPath){
            //  最好用 'dev' 作为默认分支名
            //  master就算不是默认分支时，都是不可删的
            tool.execSync('git init -b dev');
            // 更改git默认不区分大小写的配置
            // 如果A文件已提交远程，再改为小写的a文件，引用a文件会出现本地正确、远程错误，因为远程还是大A文件)
            tool.execSync('git config core.ignorecase false');
        }
    }
    checkGitignore(dirPath){
        const gitignore = '.gitignore';
        const gitignorePath = path$1.join(dirPath, gitignore);
        if(!fs$1.existsSync(gitignorePath)){
            try {
                fs$1.writeFileSync(gitignorePath, '');
            }catch (e){
                tool.error(gitignore);
            }
        }
    }
    pre(installs){
        // console.log(installs,'installs')
        for(let item of installs){
            const {plugin, config,dev,pkg} = item;
            if(plugin === 'husky'){
                // 这一个依赖.git
                const {dirPath} =  this.pkg;
                this.checkGit(dirPath);
                this.checkGitignore(dirPath);
            }
            // 有需要合并的脚本
            if(pkg){
                console.log(pkg, '有注入命令');
                const info = this.pkg.get();
                for(let key in pkg){
                    // 合并scripts内部属性
                    if(key === 'scripts'){
                        info.scripts = {...info.scripts, ...pkg.scripts};
                    }else {
                        info[key] = pkg[key];
                    }
                }
                // 更新用户json
                this.pkg.update(info);
            }
        }
    }

}

class Storage{
    constructor() {
        const rootPath = new Tool().node._root;
        this.path = path__namespace.join(rootPath, 'storage.json');
    }
    get(){
        try {
            if(!fs$1.existsSync(this.path)) throw new Error('Error storage.json path')
            return JSON.parse(fs$1.readFileSync(this.path, 'utf-8'))
        }catch (e){
            throw new Error('Error: '+e)
        }
    }
    update(content){
        // 不要提供全量更改
        this.get(this.path); // 确保文件存在
        fs$1.writeFileSync(this.path, JSON.stringify(content, null, 2));
    }
}

async function all(){
    const answer =  readlineSync.question('Will install prettier,husky,typescript by your node version? (y/n) ');
    if(answer.toLowerCase() !== 'n'){
        const installs = new Storage().get().installs;
        new Installer(installs);
    }
}

async function install(args){
    console.log('install',args);
}

async function init(){

}

var execs = {
    init,
    install,
    all
};

function main() {
    const pkg = JSON.parse(fs__namespace.readFileSync('./package.json', 'utf-8'));
    const commands = new Commands();
    const commandResolves = commands.resolve();
    // 设置命令在前，选项在后
    program.version(commands.main.split(' ')[0] + '@' + pkg.version).usage('<command> [option]');
    for (let key in commandResolves) {
        const {alias, description} = commandResolves[key];
        program
            .command(key) // 注册命令
            .alias(alias) // 配置命令别名
            .description(description) // 配置命令描述
            .action(function (name, {args}) {
                // 除了上述的命令，其他统统匹配到这里
                if (key === "*") return new Tool().error(description)
                // console.log(process.cwd())
                execs[key](args);
            });
    }

    // 最基础的一行，必须要解析
    program.parse(process.argv);
}

main();
