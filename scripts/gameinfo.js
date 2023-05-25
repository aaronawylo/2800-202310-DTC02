$("#saveButton").click(function() {

    console.log("saveButton clicked");
    $.ajax({
        url: "/saveGame",
        type: "POST",
        data: {"purpose": $("#saveButton").val(), "apiGameID": $("#saveApiGameID").val()},
        success: function(data) {
            console.log("success");
        }
    }).then(function(data) {;
        window.location.reload();
    });

});

$("#markButton").click(function() {
    console.log("markButton clicked");
    $.ajax({
        url: "/saveToPlayed",
        type: "POST",
        data: {"purpose": $("#markButton").val(), "apiGameID": $("#markApiGameID").val()},
        success: function(data) {
            console.log("success");
        }
    }).then(function(data) {;
        window.location.reload();
    });

});