import * as ts from 'typescript';
// we do not have types for javascript-natural-sort
//@ts-ignore
import naturalSort from 'javascript-natural-sort';
import { compact, isEqual, pull, clone } from 'lodash';

import { isSimilarTextExistInArray } from './is-similar-text-in-array';
import { PrettierOptions } from '../types';
import { newLineNode } from '../constants';

/**
 * This function returns all the nodes which are in the importOrder array.
 * The plugin considered these import nodes as local import declarations.
 * @param nodes all import nodes
 * @param order import order
 * @param importOrderSeparation boolean indicating if newline should be inserted after each import order
 */
export const getSortedNodes = (
    nodes: ts.ImportDeclaration[],
    order: PrettierOptions['importOrder'],
    importOrderSeparation: boolean,
) => {
    const originalNodes = nodes.map(clone);
    // const newLine =
    //     importOrderSeparation && nodes.length > 1 ? newLineNode : null;
    debugger;
    const sortedNodesByImportOrder = order.reduce(
        (
            res: (ts.ImportDeclaration | ts.ExpressionStatement)[],
            val,
        ): (ts.ImportDeclaration | ts.ExpressionStatement)[] => {
            debugger;
            const x = originalNodes.filter(
                (node) =>
                    ts.isStringLiteral(node.moduleSpecifier) &&
                    node.moduleSpecifier.text.match(new RegExp(val)) !== null,
            );

            // remove "found" imports from the list of nodes
            pull(originalNodes, ...x);

            if (x.length > 0) {
                x.sort((a, b) =>
                    naturalSort(
                        // @ts-ignore
                        a.moduleSpecifier.text,
                        // @ts-ignore
                        b.moduleSpecifier.text,
                    ),
                );

                if (res.length > 0) {
                    // return compact([...res, newLine, ...x]);
                    return compact([...res, ...x]);
                }
                return x;
            }
            return res;
        },
        [],
    );

    const sortedNodesNotInImportOrder = originalNodes.filter(
        (node) =>
            ts.isStringLiteral(node.moduleSpecifier) &&
            !isSimilarTextExistInArray(order, node.moduleSpecifier.text),
    );

    sortedNodesNotInImportOrder.sort(
        (a, b) =>
            ts.isStringLiteral(a.moduleSpecifier) &&
            ts.isStringLiteral(b.moduleSpecifier) &&
            naturalSort(a.moduleSpecifier.text, b.moduleSpecifier.text),
    );

    const shouldAddNewLineInBetween =
        sortedNodesNotInImportOrder.length > 0 && importOrderSeparation;

    const allSortedNodes = compact([
        ...sortedNodesNotInImportOrder,
        shouldAddNewLineInBetween ? newLineNode : null,
        ...sortedNodesByImportOrder,
        newLineNode, // insert a newline after all sorted imports
    ]);

    // maintain a copy of the nodes to extract comments from
    // const sortedNodesClone = allSortedNodes.map(clone);

    // TODO: Fix comments
    // const firstNodesComments = nodes[0].getLe;
    //
    // // Remove all comments from sorted nodes
    // allSortedNodes.forEach(removeComments);
    //
    // // insert comments other than the first comments
    // allSortedNodes.forEach((node, index) => {
    //     if (!isEqual(nodes[0].loc, node.loc)) {
    //         addComments(
    //             node,
    //             'leading',
    //             sortedNodesClone[index].leadingComments || [],
    //         );
    //     }
    // });
    //
    // if (firstNodesComments) {
    //     addComments(allSortedNodes[0], 'leading', firstNodesComments);
    // }

    return allSortedNodes;
};
