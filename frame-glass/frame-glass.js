/** @const */ var frameGlass = {};

/** @enum {number} */
frameGlass.Message = {
    // From frame
    ENABLE: 0,
    DISABLE: 1,
    UPDATE_HOLES: 3,

    // To frame
    UPDATE_GLASS_MARGIN: 2,
    DISABLED: 4
};
