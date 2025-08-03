import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { IThemeManager } from '@jupyterlab/apputils';
import {
  LRLanguage,
  LanguageSupport,
  HighlightStyle,
  syntaxHighlighting
} from '@codemirror/language';
import { Tag, styleTags, tags as t } from '@lezer/highlight';
import { parser } from './isql.grammar.js';

const myNewTag1: Tag = Tag.define();

const ISQLLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Keyword: t.keyword,
        Number: t.number,
        NewOne1: myNewTag1,
        Operator: t.operator,
        Identifier: t.variableName,
        Parens: t.paren
      })
    ]
  })
});

const isqlLightStyle = HighlightStyle.define([
  { tag: myNewTag1, color: '#C11C84', fontWeight: 'bold' }
]);

const isqlDarkStyle = HighlightStyle.define([
  { tag: myNewTag1, color: '#fd3db5', fontWeight: 'bold' },
]);


function isqlSupport(isDark: boolean): LanguageSupport {
  const style = isDark ? isqlDarkStyle : isqlLightStyle;
  return new LanguageSupport(ISQLLanguage, [syntaxHighlighting(style)]);
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'isql-language-plugin',
  autoStart: true,
  requires: [IEditorLanguageRegistry, IThemeManager],
  activate: (
    app: JupyterFrontEnd,
    languages: IEditorLanguageRegistry,
    themeManager: IThemeManager
  ) => {
    const dynamicLoader = async () => {
      const isDark = themeManager.theme?.toLowerCase().includes('dark') ?? false;
      console.log(`Loading ISQL language for ${isDark ? 'dark' : 'light'} theme`);
      return isqlSupport(isDark);
    };
    languages.addLanguage({
      name: 'isql',
      mime: 'text/x-isql',
      extensions: ['.isql'],
      load: dynamicLoader
    });

    console.log('ISQL language plugin activated with theme-aware dynamic loader');
  }
};

export default plugin;
