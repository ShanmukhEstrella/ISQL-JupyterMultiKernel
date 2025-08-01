import
{
  JupyterFrontEnd,
  JupyterFrontEndPlugin
}
from '@jupyterlab/application';
import
{
  INotebookTracker,
  NotebookPanel
} 
from '@jupyterlab/notebook';
import { CodeCell } from '@jupyterlab/cells';

const SQL_MIME = 'text/x-isql';

const ISQLDisplayName = 'ISQL';

const hasDropdown = (cell: CodeCell) =>
  !!cell.node.querySelector('.cell-kernel-selector-wrapper');

const isISQLKernel = (panel: NotebookPanel): boolean =>
  (panel.sessionContext.kernelDisplayName ?? '').toLowerCase() ===
  ISQLDisplayName.toLowerCase();

const extension: JupyterFrontEndPlugin<void> = {
  id: 'cell-kernel-selector',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (_app, tracker) => {
    console.log('Inline Kernel Selector Activated');
    (() => {
      if (document.getElementById('cell‑kernel‑selector‑css')) return;
      const font = Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'
      });
      const style = Object.assign(document.createElement('style'), {
        id: 'cell‑kernel‑selector‑css',
        textContent: /* css */ `
          select.cell-kernel-selector-dropdown option[value="Python"]{
            color:rgb(37,235,37);font-weight:600;
          }
          select.cell-kernel-selector-dropdown option[value="SQL"]{
            color:rgb(21,17,224);font-weight:600;
          }
          .jp-InputArea-editor.has-kernel-dropdown{
            position:relative!important;padding-top:32px!important;
          }
          .cell-kernel-selector-wrapper{
            position:absolute;top:6px;left:8px;z-index:20;
            background:var(--jp-layout-color2);
            border:1px solid var(--jp-border-color2);
            padding:2px 6px;border-radius:4px;
            display:flex;gap:4px;font:500 11px 'Inter',sans-serif;
          }
          select.cell-kernel-selector-dropdown{
            padding:2px 6px;font:11px 'Inter',sans-serif;
            border:1px solid var(--jp-border-color2);
            background:var(--jp-layout-color0);max-width:120px;cursor:pointer;
          }
        `
      });
      document.head.append(font, style);
    })();
    const choices = ['-- Select Kernel --', 'Python', 'SQL'] as const;
    const pythonHdr =
      "#Code in Python below. Don't Remove this Header!!";
    const addDropdown = (cell: CodeCell): void => {
      if (hasDropdown(cell)) return;
      const host = cell.node.querySelector('.jp-InputArea-editor');
      if (!host) return;
      const sel = document.createElement('select');
      sel.className = 'cell-kernel-selector-dropdown';
      choices.forEach(n => {
        const opt = document.createElement('option');
        opt.text = n;
        opt.value = n === '-- Select Kernel --' ? '' : n;
        sel.appendChild(opt);
      });
      let prog = false;
      const apply = (k: 'Python' | 'SQL') => {
        const srcLines = cell.model.sharedModel.source
          .split('\n')
          .filter(l => !l.trim().startsWith('#Kernel:') && l !== pythonHdr);
        const newLines =
          k === 'Python'
            ? ['#Kernel: Python', pythonHdr, ...srcLines]
            : [...srcLines];
        const newSrc = newLines.join('\n');
        if (newSrc === cell.model.sharedModel.source) return;
        prog = true;
        cell.model.sharedModel.source = newSrc;
        cell.model.mimeType =
          k === 'Python' ? 'text/x-python' : SQL_MIME;
        prog = false;
        cell.editor?.setCursorPosition({
          line: k === 'Python' ? 2 : 0,
          column: 0
        });
      };

      const sync = () => {
        if (prog) return;
        const first = cell.model.sharedModel.source.split('\n')[0]?.toLowerCase();
        sel.value = first === '#kernel: python' ? 'Python' : 'SQL';
      };

      sel.onchange = () => apply((sel.value || 'SQL') as any);
      cell.model.contentChanged.connect(sync);

      const wrap = document.createElement('div');
      wrap.className = 'cell-kernel-selector-wrapper';
      wrap.innerHTML = '<label>Run:</label>';
      wrap.appendChild(sel);

      host.appendChild(wrap);
      host.classList.add('has-kernel-dropdown');
      sync();
    };

    const inject = (panel: NotebookPanel) =>
      panel.content.widgets.forEach(w => {
        if (w.model.type === 'code') addDropdown(w as CodeCell);
      });

    const removeAll = (panel: NotebookPanel) =>
      panel.content.widgets.forEach(w => {
        if (w.model.type !== 'code') return;
        w.node
          .querySelector('.cell-kernel-selector-wrapper')
          ?.remove();
        w.node
          .querySelector('.jp-InputArea-editor')
          ?.classList.remove('has-kernel-dropdown');
      });

    tracker.widgetAdded.connect((_t: INotebookTracker, panel: NotebookPanel) => {
      const refresh = () => {
        if (isISQLKernel(panel)) {
          inject(panel);
        } else {
          removeAll(panel);
        }
      };
      panel.context.ready.then(refresh);
      panel.sessionContext.kernelChanged.connect(refresh);
      panel.content.model?.cells.changed.connect(
        (_list: any, ch: import('@jupyterlab/observables').IObservableList.IChangedArgs<any>) => {
          if (!isISQLKernel(panel)) return;
          ch.newValues?.forEach(m => {
            if (m.type !== 'code') return;
            const v = panel.content.widgets.find(
              (w: import('@jupyterlab/cells').Cell) => w.model === m
            ) as CodeCell | undefined;
            v?.ready.then(() =>
              requestAnimationFrame(() => addDropdown(v))
            );
          });
        }
      );

      panel.content.activeCellChanged.connect(() => {
        if (!isISQLKernel(panel)) return;
        const c = panel.content.activeCell;
        if (c?.model.type === 'code') addDropdown(c as CodeCell);
      });
    });
  }
};

export default extension;
