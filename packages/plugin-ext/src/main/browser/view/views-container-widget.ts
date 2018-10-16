/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { ViewContainer, View } from '../../../common';
import { TreeViewWidget } from './tree-views-main';
import { BaseWidget } from '@theia/core/lib/browser';

export function createElement(className?: string): HTMLDivElement {
    const div = document.createElement('div');
    if (className) {
        div.classList.add(className);
    }
    return div;
}

export interface SectionParams {
    view: View,
    container: ViewsContainerWidget
}

export class ViewsContainerWidget extends BaseWidget {

    private sections: Map<string, ViewContainerSection> = new Map<string, ViewContainerSection>();

    sectionTitle: HTMLElement;

    constructor(protected viewContainer: ViewContainer,
        protected views: View[]) {
        super();

        this.id = `views-container-widget-${viewContainer.id}`;
        this.title.closable = true;
        this.title.caption = this.title.label = viewContainer.title;

        this.addClass('theia-views-container');

        // create container title
        this.sectionTitle = createElement('theia-views-container-title');
        this.sectionTitle.innerText = viewContainer.title;
        this.node.appendChild(this.sectionTitle);

        // update sections
        const instance = this;

        this.views.forEach(view => {
            const section = new ViewContainerSection(view, instance);
            this.sections.set(view.id, section);
            this.node.appendChild(section.node);
        });
    }

    public hasView(viewId: string): boolean {
        const result = this.views.find(view => view.id === viewId);
        return result !== undefined;
    }

    public addWidget(viewId: string, viewWidget: TreeViewWidget) {
        const section = this.sections.get(viewId);
        if (section) {
            section.addViewWidget(viewWidget);
        }
    }

}

export class ViewContainerSection {

    node: HTMLDivElement;

    control: HTMLDivElement;
    title: HTMLDivElement;
    content: HTMLDivElement;

    opened: boolean = true;

    private viewWidget: TreeViewWidget;

    constructor(protected view: View, container: ViewsContainerWidget) {
        this.node = createElement('theia-views-container-section');

        this.createTitle();
        this.createContent();
    }

    createTitle() {
        const header = createElement('theia-views-container-section-title');
        this.node.appendChild(header);

        this.control = createElement('theia-views-container-section-control');
        this.control.setAttribute('opened', '' + this.opened);
        header.appendChild(this.control);

        this.title = createElement('theia-views-container-section-label');
        this.title.innerText = this.view.name;
        header.appendChild(this.title);

        header.onclick = () => { this.handleClick(); };
    }

    createContent() {
        this.content = createElement('theia-views-container-section-content');
        this.content.setAttribute('opened', '' + this.opened);
        this.node.appendChild(this.content);

        this.content.innerHTML = '<div style=\'padding: 20px 0px; text-align: center; \'>' + this.view.name + '</div>';
    }

    handleClick() {
        this.opened = !this.opened;

        this.control.setAttribute('opened', '' + this.opened);
        this.content.setAttribute('opened', '' + this.opened);

        this.forceUpdate();
    }

    addViewWidget(viewWidget: TreeViewWidget) {
        this.content.innerHTML = '';

        this.viewWidget = viewWidget;
        this.content.appendChild(viewWidget.node);

        viewWidget.model.onChanged(e => {
            this.forceUpdate();
        });

        this.forceUpdate();
    }

    forceUpdate() {
        if (this.viewWidget) {
            this.viewWidget.up();
        }
    }

}