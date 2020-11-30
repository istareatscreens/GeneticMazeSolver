mergeInto(LibraryManager.library, {
    pass_coordinates: function () {
        var event = new CustomEvent("gotCoordinates", { detail: "testing", poop: 3 });
        window.dispatchEvent(event);

    },
});