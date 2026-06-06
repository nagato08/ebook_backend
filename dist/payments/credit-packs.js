"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPack = exports.CREDIT_PACKS = void 0;
exports.CREDIT_PACKS = [
    {
        id: 'discovery',
        label: 'Decouverte',
        credits: 140,
        amount: '10500',
        currency: 'XAF',
    },
    {
        id: 'creator',
        label: 'Createur',
        credits: 320,
        amount: '22500',
        currency: 'XAF',
    },
    { id: 'pro', label: 'Pro', credits: 700, amount: '45000', currency: 'XAF' },
    {
        id: 'business',
        label: 'Business',
        credits: 2000,
        amount: '116000',
        currency: 'XAF',
    },
];
const findPack = (id) => exports.CREDIT_PACKS.find((p) => p.id === id);
exports.findPack = findPack;
//# sourceMappingURL=credit-packs.js.map