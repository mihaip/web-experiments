// Copyright 2017 Quip

var domMirroring = {};

/** @enum {number} */
domMirroring.Message = {
    // From frame
    START: 0,
    UPDATE: 1,

    // To frame
    DISPATCH_EVENT: 2
};
