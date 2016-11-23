$(document).ready(function() {
    var logged_in = getQueryVal("/launchbit-networks/js/new-campaign.js", "li"),
        cc_errors = getQueryVal("/launchbit-networks/js/new-campaign.js", "cce"),
        transaction_id = getQueryVal("/launchbit-networks/js/new-campaign.js", "tID"),
        // look for cookie
        c_start = document.cookie.indexOf("new-campaign="),
        values = {
            "weekly_spend": "",
            "tags": [],
            "max_cpc": "",
            "creatives": {
                "images": []
            },
            "destination_url": "",
            "cc_errors": "",
            "cc": {},
            "networks" : [
                "network_nd",
                "network_bsa"
            ],
            "transactionID" : transaction_id
        };

    $('a.next-button, a.back-button').click(function() {
        $('h4 a.' + $(this).attr('href').substr(1)).click();
        return false;
    });
    //------ make sure that a panel stays open ------
	$('.panel-heading a').on('click',function(e){
	    if($(this).parents('.panel').children('.panel-collapse').hasClass('in')){
	        e.stopPropagation();
	    }
	});
    //------ Set Budget panel ------
    $('div#weekly_spend input[name="weekly_spend"]').change(function() {
        if ($(this).val() < 1000) {
            $(this).val(1000);
        }

        $("h4 a.weekly_spend .valid span").text($(this).val());

        $("div#summary .weekly_spend .value").text("$ " + $(this).val());

        values["weekly_spend"] = encodeURIComponent($(this).val());
        setCookies(values);

        getSampleAnalytics(values["weekly_spend"], values["tags"], values["max_cpc"], displayAnalytics);
    });

    //------ Set Demographics panel ------
    $('div#tags input[type="checkbox"]').change(function() {

        var val = $(this).val(),
            self = $(this),
            index = $.inArray(val, values["tags"]);

        if ($(this).is(":checked")) {
            if (index == -1) {
                values["tags"].push(val);
            }

            values["tags"].sort();
            $.ajax({
                url: "/launchbit-networks/new-campaign/?tag_info=" + val,
                success: function(data) {
                    $('div#tags input[name="tag-'+val+'"]').parent("h4").next(".examples").html(data);
                }
            });
        } else {
            if (index != -1) {
                values["tags"].splice(index, 1);
                $('div#tags input[name="tag-'+val+'"]').parent("h4").next(".examples").html("");
            }
        }

        $.ajax({
            url: "/launchbit-networks/new-campaign/?update=[" + values["tags"] + "]",
            dataType: "json",
            success: function(data) {
                $(".potentialcustomer .badge").text(data.potential_customers);
                $("div#max_cpc span.value span").text("$" + data.CPC_low.toFixed(2) + "-$" + data.CPC_high.toFixed(2) + (data.potential_customers ? "" : "*"));
            }
        });

        getSampleAnalytics(values["weekly_spend"], values["tags"], values["max_cpc"], displayAnalytics);

        if (values["tags"].length <= 0) {
            $("div#max_cpc .no_tag_error").show();
        } else {
            $("div#max_cpc .no_tag_error").hide();
        }

        //if no tags are selected
        if (values["tags"].length <= 0) {
            $("h4 a.tags .valid").hide();
            $("h4 a.tags .error").show();

            $("div#summary .tags .error").show();
            $("div#summary .tags .value ul").text("");
            $("div#tags .counter .number").text(0);

            values["tags_string"] = "";
        } else {
            var tags_id = values["tags"].slice(0);

            var tags_string = $('div#tags label[for="tag-' + tags_id[0] + '"]').text();

            if (tags_id.length == 2) {
                tags_string += " and " + $('div#tags label[for="tag-' + tags_id[1] + '"]').text();
            } else if (tags_id.length > 2) {
                tags_string += ", " + $('div#tags label[for="tag-' + tags_id[1] + '"]').text() + " and " + (tags_id.length - 2) + " more";
            }

            $("h4 a.tags .error").hide();
            $("h4 a.tags .valid").text(tags_string);
            $("h4 a.tags .valid").show();

            $("div#summary .tags .error").hide();

            tags_string = [];

            $("div#summary .tags .value ul").html("");
            $("div#tags input:checked").each(function() {
                var tag_name = $('div#tags label[for="tag-' + $(this).val() + '"]').text();

                $("div#summary .tags .value ul").append("<li>" + tag_name + "</li>");
                tags_string.push(tag_name);
            });

            values["tags_string"] = encodeURIComponent(tags_string);
        }

        setCookies(values);
    });

    //------ Set Networks panel ------
    $('div#networks input[type="checkbox"]').change(function() {
        var val = $(this).attr("id"),
        self = $(this),
        index = $.inArray(val, values["networks"]);

        if ($(this).is(":checked")) {
            if (index == -1) {
                values["networks"].push(val);
                //show the creatives uploads for this network
                if (val == "network_nd") {
                    $("#nd_creatives").show();
                } else if (val == "network_bsa") {
                    $("#bsa_creatives").show();
                }
            }

            values["networks"].sort();
        } else {
            if (index != -1) {
                values["networks"].splice(index, 1);
            }
            //hide the creatives uploads for this network
            if (val == "network_nd") {
                $("#nd_creatives").hide();
            } else if (val == "network_bsa") {
                $("#bsa_creatives").hide();
            }
        }

        values["networks"].sort();

        $("div#summary .networks .value ul").html("");
        if (values["networks"].length >= $('div#networks input[type="checkbox"]').length) {
            $("h4 a.networks .error").hide();
            $("h4 a.networks .valid").text("All available networks");
            $("div#summary .networks .value ul").append("<li>All available networks</li>");
            $("h4 a.networks .valid").show();
            $("div#summary .networks .error").hide();

            values["network_string"] = "All available networks";
        } else if (values["networks"].length > 0) {
            var network_name = $("div#networks input#" + values["networks"][0]).val();
            $("h4 a.networks .error").hide();
            $("h4 a.networks .valid").text(network_name);
            $("div#summary .networks .value ul").append("<li>" + network_name + "</li>");
            $("h4 a.networks .valid").show();
            $("div#summary .networks .error").hide();

            values["network_string"] = network_name;
        } else {
            $("h4 a.networks .error").show();
            $("h4 a.networks .valid").text("");
            $("h4 a.networks .valid").hide();
            $("div#summary .networks .error").show();
            $("div#creatives p.error").show();

            values["network_string"] = "";
        }

        setCookies(values);
    });

    //------ Set CPC panel ------
    $('div#max_cpc input[name="max_cpc"]').change(function() {
        if ($(this).val() < .35) {
            $(this).val("0.35");
        }

        // fix to 2 decimals
        $(this).val(parseFloat($(this).val()).toFixed(2));

        $("h4 a.max_cpc .error").hide();
        $("h4 a.max_cpc .valid span").text($(this).val());
        $("h4 a.max_cpc .valid").show();

        $("div#summary .max_cpc .value").text("$ " + $(this).val());

        values["max_cpc"] = encodeURIComponent($(this).val());
        setCookies(values);

        getSampleAnalytics(values["weekly_spend"], values["tags"], values["max_cpc"], displayAnalytics);
    });

    //------ Upload Creatives panel ------
    //text ad
    $('div#creatives .edit_ad125 .ad125').click(function() {
        $('div#creatives #textImage input[name="qqfile"]').click();

        return false;
    });

    $('div#nd_creatives a.preview_ad125').click(function() {
        $('div#nd_creatives .edit_ad125').show();
        $('div#nd_creatives .preview_ad125').hide();

        return false;
    });

    $('div#nd_creatives a.edit_ad125').click(function() {
        $('div#nd_creatives .preview_ad125').show();
        $('div#nd_creatives .edit_ad125').hide();

        return false;
    });


    $('div#creatives input[name="textTitleText"]').change(function() {
        if ($(this).val()) {
            values["textTitleText"] = encodeURIComponent($(this).val().replace(/"/g, "\\\""));
            $('div#creatives .preview_ad125 #textTitleText2 a').text($(this).val());
        } else {
            values["textTitleText"] = null;
            $('div#creatives .preview_ad125 #textTitleText2 a').text('');
        }

        checkCreatives(values);
    });

    $('div#creatives textarea[name="textBodyText"]').change(function() {
        if ($(this).val()) {
            //replace line breaks
            var clean_string = $(this).val().replace(/(\n|\t|\r)/g," ");
            $(this).val(clean_string);
            values["textBodyText"] = encodeURIComponent($(this).val().replace(/"/g, "\\\""));
            $('div#creatives .preview_ad125 #textBodyText2').text($(this).val());
        } else {
            values["textBodyText"] = null;
            $('div#creatives .preview_ad125 #textBodyText2').text('');
        }

        checkCreatives(values);
    });

    $("#textImage input[name=qqfile]").change(function() {
        $('#textimageiframe').remove();
        var ext = $("#textImage input[name=qqfile]").val().match(/\.([a-zA-Z]+)$/);
        var trans = $("#textImage input[name=transaction]").val();
        $('<iframe style="display:none;" name="textimageiframe" id="textimageiframe" />').load(function(){
            if ($("#textimageiframe").contents().find("body").text()) {
                //use query to avoid caching
                var d = new Date().getTime();
                var data = $.parseJSON($("#textimageiframe").contents().find("body").text());
                if (data.error) {
                    alert(data.error);
                } else {
                    $("#textImagePreview").css("background-image","url('https://www.launchbit.com/a/"+trans+ext[0]+"?a="+d+"')");
                    $("#textImagePreview2").css("background-image","url('https://www.launchbit.com/a/"+trans+ext[0]+"?a="+d+"')");
                    $("a.ad125").removeClass("empty");
                    $("#textImagePreview span").hide();
                    checkCreatives(values);
                }
            }
        }).appendTo("#textImagePreview");
        $("#textImage").attr("target","textimageiframe");
        $("#textImage").submit();
        $("#textImage input[name=qqfile]").val("");
    });

    //banner ad
    $('div#creatives .ad468').click(function() {
        $('div#creatives #longImage input[name="qqfile"]').click();

        return false;
    });

    $("#longImage input[name=qqfile]").change(function() {
        $('#longimageiframe').remove();
        var ext = $("#longImage input[name=qqfile]").val().match(/\.([a-zA-Z]+)$/);
        var trans = $("#longImage input[name=transaction]").val();
        $('<iframe style="display:none" name="longimageiframe" id="longimageiframe"/>').load(function(){
            //if is hack for avoiding problem on double loading
            if ($("#longimageiframe").contents().find("body").text()) {
                //use query to avoid caching
                var d = new Date().getTime();
                var data = $.parseJSON($("#longimageiframe").contents().find("body").text());
                if (data.error) {
                    alert(data.error);
                } else {
                    $("#longImagePreview").css("background-image","url('https://www.launchbit.com/a/"+trans+ext[0]+"?a="+d+"')");
                    $("a.ad468").removeClass("empty");
                    $("#longImagePreview span").hide();
                    checkCreatives(values);
                }
            }

        }).appendTo("#longImagePreview");
        $("#longImage").attr("target","longimageiframe");
        $("#longImage").submit();
        $("#longImage input[name=qqfile]").val("");
    });

    //bsa ad
    $('div#creatives .edit_ad130 .ad130').click(function() {
        $('div#creatives #bsaImage input[name="qqfile"]').click();

        return false;
    });

    $('div#bsa_creatives a.preview_ad130').click(function() {
        $('div#bsa_creatives .edit_ad130').show();
        $('div#bsa_creatives .preview_ad130').hide();

        return false;
    });

    $('div#bsa_creatives a.edit_ad130').click(function() {
        $('div#bsa_creatives .preview_ad130').show();
        $('div#bsa_creatives .edit_ad130').hide();

        return false;
    });

	/*
    $('div#creatives input[name="bsaTitleText"]').change(function() {
        if ($(this).val()) {
            values["bsaTitleText"] = encodeURIComponent($(this).val().replace(/"/g, "\\\""));
            $('div#creatives .preview_ad130 #bsaTitleText2 a').text($(this).val());
        } else {
            values["bsaTitleText"] = null;
            $('div#creatives .preview_ad130 #bsaTitleText2 a').text('');
        }
        checkCreatives(values);
    });
    */

    $('div#creatives textarea[name="bsaBodyText"]').change(function() {
        if ($(this).val()) {
            var clean_string = $(this).val().replace(/(\n|\t|\r)/g," ");
            $(this).val(clean_string);
            values["bsaBodyText"] = encodeURIComponent($(this).val().replace(/"/g, "\\\""));
            $('div#creatives .preview_ad130 #bsaBodyText2').text($(this).val());
        } else {
            values["bsaBodyText"] = null;
            $('div#creatives .preview_ad130 #bsaBodyText2').text('');
        }

        checkCreatives(values);
    });

    $("#bsaImage input[name=qqfile]").change(function() {
        $('#bsaimageiframe').remove();
        var ext = $("#bsaImage input[name=qqfile]").val().match(/\.([a-zA-Z]+)$/);
        var trans = $("#bsaImage input[name=transaction]").val();
        $('<iframe style="display:none;" name="bsaimageiframe" id="bsaimageiframe" />').load(function(){
            if ($("#bsaimageiframe").contents().find("body").text()) {
                //use query to avoid caching
                var d = new Date().getTime();
                var data = $.parseJSON($("#bsaimageiframe").contents().find("body").text());
                if (data.error) {
                    alert(data.error);
                } else {
                    $("#bsaImagePreview").css("background-image","url('https://www.launchbit.com/a/"+trans+ext[0]+"?a="+d+"')");
                    $("#bsaImagePreview2").css("background-image","url('https://www.launchbit.com/a/"+trans+ext[0]+"?a="+d+"')");
                    $("a.ad130").removeClass("empty");
                    $("#bsaImagePreview span").hide();
                    checkCreatives(values);
                }
            }
        }).appendTo("#bsaImagePreview");
        $("#bsaImage").attr("target","bsaimageiframe");
        $("#bsaImage").submit();
        $("#bsaImage input[name=qqfile]").val("");
    });

    $('div#creatives a.clear_ad').click(function() {
        if ($(this).attr('href') == "#long") {
            $.post("/launchbit-networks/create-campaign-callback/", {
                image: "long",
                removeImage: 1
            }, function(data) {
                $('div#creatives .ad468').addClass('empty');
                $('div#creatives .ad468').css('background-image', "none");
                checkCreatives(values);
            }, 'json');
        } else if ($(this).attr('href') == "#text") {
            $.post("/launchbit-networks/create-campaign-callback/", {
                image: "text",
                removeImage: 1
            }, function(data) {
                $('div#creatives .ad125').addClass('empty');
                $('div#creatives .ad125').css('background-image', "none");
                checkCreatives(values);
            }, 'json');
        } else if ($(this).attr('href') == "#bsa") {
            $.post("/launchbit-networks/create-campaign-callback/", {
                image: "bsa",
                removeImage: 1
            }, function(data) {
                $('div#creatives .ad130').addClass('empty');
                $('div#creatives .ad130').css('background-image', "none");
                checkCreatives(values);
            }, 'json');
        }
        return false;
    });

    //------ Set URL panel ------
    $('div#destination_url input[name="destination_url"]').change(function() {
        if (!validURL($(this).val())) {
            values["destination_url"] == null;

            $("h4 a.destination_url .error").show();
            $("h4 a.destination_url .valid").hide();

            $("div#summary .creatives .destination_url .error").show();
            $("div#summary .creatives .destination_url .value").hide();

            setCookies(values);

            return false;
        }

        $("div#summary .creatives .destination_url .value a").text($(this).val());
        $("div#summary .creatives .destination_url .value a").attr("href", $(this).val());

        values["destination_url"] = encodeURIComponent($(this).val());

        $("h4 a.destination_url .error").hide();
        $("h4 a.destination_url .valid").text($(this).val());
        $("h4 a.destination_url .valid").show();

        $("div#summary .creatives .destination_url .error").hide();
        $("div#summary .creatives .destination_url .value").show();

        setCookies(values);
    });

    //------ Check for errors ------
    $('#launch').click(function() {

        var no_errors = true,
            message = "";

        // check values
        //if budget is below $1000
        if (values["weekly_spend"] < 1000) {
            no_errors = false;
            message = "The monthly budget is too low.";
        }

        //if no tags are chosen
        if (values["tags"] == null || values["tags"].length == 0) {
            no_errors = false;
            message = "Please choose your target demographic.";
        }

        //if the cpc bid is under a penny
        if (values["max_cpc"] < .01) {
            no_errors = false;
            message = "Your CPC bid is too low.";
        }

        //if the newsletterdirectory network box is checked
        if (values["networks"].indexOf("network_nd") != -1) {
            //make sure text and banner ads are complete and they are both uploaded
            if (values["creatives"] == null ||
                (values["creatives"]["images"].indexOf("Text + Image (125x125)") != -1 && (values["textTitleText"] == null || values["textTitleText"].length == 0 || values["textBodyText"] == null || values["textBodyText"].length == 0) ) ||
                (values["creatives"]["images"].indexOf("Text + Image (125x125)") == -1 || values["creatives"]["images"].indexOf("Banner") == -1)) {
                no_errors = false;
                message = "Please upload all parts of both the Text + Image (125x125) and Banner ad formats.";
            }
        }

        //bsa ad required
        /*
        if (values["networks"].indexOf("network_bsa") != -1) {
            //make sure all bsa parts are complete
            if (values["creatives"] == null || values["creatives"]["images"].indexOf("Text + Image (130x100)") == -1 ||
               (values["creatives"]["images"].indexOf("Text + Image (130x100)") != -1 && (values["bsaTitleText"] == null || values["bsaTitleText"].length == 0 || values["bsaBodyText"] == null || values["bsaBodyText"].length == 0))) {
                no_errors = false;
                message = "Please upload all parts of the Text + Image (130x100) ad format."
            }

        }
        */
        if (values["networks"].indexOf("network_bsa") != -1) {
            //make sure all bsa parts are complete
            if (values["creatives"] == null || values["creatives"]["images"].indexOf("Text + Image (130x100)") == -1 ||
               (values["creatives"]["images"].indexOf("Text + Image (130x100)") != -1 && (values["bsaBodyText"] == null || values["bsaBodyText"].length == 0))) {
                no_errors = false;
                message = "Please upload all parts of the Text + Image (130x100) ad format."
            }

        }

        if (values["destination_url"] == null || values["destination_url"].length == 0) {
            //not actually validated
            no_errors = false;
            message = "Please fill in your destination URL.";
        }

        if (no_errors) {
            if (logged_in != "cc") {
                $("div#summary form#loginform").submit();
            } else {
                $("div#summary form#ccform").submit();
            }
        } else {
            $("div#summary form#loginform p.alert").text(message);
            $("div#summary form#loginform p.alert").show();
        }

        return false;
    });

    //------ login related stuff ------
    var toggle_new = true;

    $("div#summary a.new").click(function() {
        $('div#summary .new').hide();
        $('div#summary .old').show();

        toggle_new = false;

        $('div#summary form#loginform input[name=new]').val(0);

        return false;
    });

    $("div#summary a.old").click(function() {
        $('div#summary .old').hide();
        $('div#summary .new').show();

        toggle_new = true;

        $('div#summary form#loginform input[name=new]').val(1);

        return false;
    });

    $("div#summary form#loginform").submit(function() {
        var errors = false,
            message = "",
            toggle_new = $("div#summary form#loginform input[name=new]").val();

        $("div#summary form#loginform p.alert").hide();
        $("div#summary form#loginform p.alert").text("");

        $("#submitiframe").remove();
        $(this).attr('target', 'submitiframe');

        $('<iframe style="display: none;" name="submitiframe" id="submitiframe" />').load(function(){
            if ($("#submitiframe").contents().find("body").text()) {
                //use query to avoid caching
                var d = new Date().getTime();
                var data = $.parseJSON($("#submitiframe").contents().find("body").text());

                if (data.errors) {
                    if ($("div#summary form#loginform p.alert").text() == "") {
                        $("div#summary form#loginform p.alert").text(data.errors);
                        $("div#summary form#loginform p.alert").show();
                    }
                } else {
                    if (data.creditCards.length > 0) {
                        //default card exists
                        window.location = data.redirect;
                        return false;
                    } else {
                        //get a credit card in the system
                        $("div#summary #cc").show();
                        $("div#summary #login").hide();
                        $("div#summary form#ccform").attr("action",data.trAction);
                        $("div#summary form#ccform input[name=tr_data]").val(data.trData);

                        logged_in = "cc";
                    }
                }
            }

        }).appendTo($(this));


    });

    $("div#summary form#ccform").submit(function() {
        values["submit"] = 1;
        setCookies(values);

    });

    $("div#summary textarea[name=notes]").change(function() {
        values["notes"] = encodeURIComponent($(this).val().replace(/"/g, "\\\""));
        setCookies(values);
    });

    $("div#summary form#ccform input[type=text], div#summary form#ccform select").change(function() {
        if ($(this).attr('id')) {
            values["cc"][$(this).attr('id')] = $(this).val();
        }

        setCookies(values);
    });

    //------ if the cookie has data, set the form to the values stored in the cookie
    //------ if the cookie doesn't have the data, set the form to default values
    if (document.cookie.indexOf("new-campaign=") != -1) {
        c_start = document.cookie.indexOf("=", c_start) + 1;
        var c_end = document.cookie.indexOf(";", c_start),
            _values;

        if (c_end == -1) {
            _values = JSON.parse(document.cookie.substring(c_start));
        } else {
            _values = JSON.parse(document.cookie.substring(c_start, c_end));
        }

        for (var k in _values) {
            if (typeof(_values[k]) == "string") {
                values[k] = unescape(_values[k]);
            } else {
                values[k] = _values[k];
            }
        }
    }

    if (values["weekly_spend"]) {
        $('div#weekly_spend input[name="weekly_spend"]').val(values["weekly_spend"]);
    } else {
        $('div#weekly_spend input[name="weekly_spend"]').val(1000);
    }

    //reset them all first, then set them
    $('div#tags input').prop('checked', false);
    if (values["tags"].length) {
        for (x in values["tags"]) {
            $('div#tags input[value="' + values["tags"][x] + '"]').prop('checked', true);
        }
    }

    $('div#networks input').prop('checked', false);
    if (values["networks"].length) {
        for (x in values["networks"]) {
            $('div#networks input#' + values["networks"][x]).prop('checked', true);
        }
    } else {
        $('div#networks input').prop('checked', true);
    }

    if (values["max_cpc"]) {
        $('div#max_cpc input[name="max_cpc"]').val(values["max_cpc"]);
    } else {
        $('div#max_cpc input[name="max_cpc"]').val(0.35);
    }

    if (values["textTitleText"]) {
        $('div#creatives input[name="textTitleText"]').val(values["textTitleText"]);
    } else {
        $('div#creatives input[name="textTitleText"]').val("");
    }
    if (values["textBodyText"]) {
        $('div#creatives textarea[name="textBodyText"]').val(values["textBodyText"]);
    } else {
        $('div#creatives textarea[name="textBodyText"]').val("");
    }
    if (values["bsaTitleText"]) {
        $('div#creatives input[name="bsaTitleText"]').val(values["bsaTitleText"]);
    } else {
        $('div#creatives input[name="bsaTitleText"]').val("");
    }
    if (values["bsaBodyText"]) {
        $('div#creatives textarea[name="bsaBodyText"]').val(values["bsaBodyText"]);
    } else {
        $('div#creatives textarea[name="bsaBodyText"]').val("");
    }

    if (values["destination_url"]) {
        $('div#destination_url input[name="destination_url"]').val(values["destination_url"]);
    } else {
        $('div#destination_url input[name="destination_url"]').val("");
    }

    if (values["notes"]) {
        $("div#summary textarea[name=notes]").val(values["notes"]);
    } else {
        $("div#summary textarea[name=notes]").val("");
    }

    for (var cc_field in values["cc"]) {
        $("div#summary input#" + cc_field).val(values["cc"][cc_field]);
        $("div#summary select#" + cc_field).val(values["cc"][cc_field]);
    }

    //------ trigger the change events to set all the messaging
    $('div#weekly_spend input[name="weekly_spend"]').change();
    $('div#tags input').change();
    $('div#networks input').change();
    $('div#max_cpc input[name="max_cpc"]').change();
    $('div#creatives input[name="textTitleText"]').change();
    $('div#creatives textarea[name="textBodyText"]').change();
    $('div#creatives input[name="bsaTitleText"]').change();
    $('div#creatives textarea[name="bsaBodyText"]').change();
    $('div#destination_url input[name="destination_url"]').change();
    $("div#summary textarea[name=notes]").change();
    if (logged_in == "true") {
        $("div#summary a.new").click();
    } else {
        $("div#summary a.old").click();
    }

    if (cc_errors != "false") {
        $("h4 a.summary").click();
        $("div#summary #cc").show();
        $("div#summary #login").hide();
        $("#cc_errors").show();
        logged_in = "cc";
    }

});

//----- Helper functions -----
function displayAnalytics(data) {
    var analytics_html = "<table class=\"table table-bordered table-striped\"><thead><tr><td>Publisher Name</td><td>Clicks</td><td>Impressions</td><td>CTR</td><td>Block Publisher</td></tr></thead><tbody></tbody></table>";

    if (data.pickpubs.length > 0) {
        $("div#max_cpc div#analytics div#analytics_table").html(analytics_html);

        for (var i = 0; i < data.pickpubs.length; i++) {
            $("div#max_cpc div#analytics table tbody").append("<tr class=\"" + (i % 2 ? "even" : "odd" ) + "\"><td>" + data.pickpubs[i].name + "</td><td>" + data.pickpubs[i].clicks + "</td><td>" + data.pickpubs[i].impressions + "</td><td>" + data.pickpubs[i].ctr + "%</td><td><a onclick=\"return false;\">Block</a></td></tr>");
        }

        $("#approx_lead .badge").text(data.nlowleads + "-" + data.nhighleads);
        $("#approx_cpl .badge").text("$" + data.low_cpl + "-$" + data.high_cpl);

        $("div#max_cpc div#analytics").show();
    } else {
        $("div#max_cpc div#analytics").hide();
    }
}

function setCookies(values) {
    var now = new  Date(),
        time = now.getTime();
    time += 1000 * 60 * 60 * 24;
    now.setTime(time);

    document.cookie = "new-campaign=" + JSON.stringify(values) + "; expires = " + now.toGMTString() + "; path = /";
}

function checkCreatives(values) {
    var creatives = [],
        message = "";

    //if nd network is selected
    if (values["networks"].indexOf("network_nd") != -1 && $('div#creatives input[name="textTitleText"]').val() && $('div#creatives textarea[name="textBodyText"]').val() && !$('#textImagePreview').hasClass("empty")) {
        creatives.push("Text + Image (125x125)");
    }
    if (!$('#textImagePreview').hasClass("empty")) {
        $("#textImagePreview span").hide();
        $("div.edit_ad125 a.clear_ad").show();
    } else {
        $("#textImagePreview span").show();
        $("div.edit_ad125 a.clear_ad").hide();
    }

    if (values["networks"].indexOf("network_nd") != -1 && !$('#longImagePreview').hasClass("empty")) {
        creatives.push("Banner");
    }
    if (!$('#longImagePreview').hasClass("empty")) {
        $("#longImagePreview span").hide();
        $("div.edit_ad468 a.clear_ad").show();
    } else {
        $("#longImagePreview span").show();
        $("div.edit_ad468 a.clear_ad").hide();
    }

    //if bsa network is selected
    /*
    if (values["networks"].indexOf("network_bsa") != -1 && $('div#creatives input[name="bsaTitleText"]').val() && $('div#creatives textarea[name="bsaBodyText"]').val() && !$('#bsaImagePreview').hasClass("empty")) {
        creatives.push("Text + Image (130x100)");
    }
    */
    if (values["networks"].indexOf("network_bsa") != -1 && $('div#creatives textarea[name="bsaBodyText"]').val() && !$('#bsaImagePreview').hasClass("empty")) {
        creatives.push("Text + Image (130x100)");
    }
    if (!$('#bsaImagePreview').hasClass("empty")) {
        $("#bsaImagePreview span").hide();
        $("div.edit_ad130 a.clear_ad").show();
    } else {
        $("#bsaImagePreview span").show();
        $("div.edit_ad130 a.clear_ad").hide();
    }

    values["creatives"]["images"] = creatives;

    setCookies(values);

    message = creatives.join(' and ');

    if (message == "") {
        $("h4 a.creatives .error").show();
        $("h4 a.creatives .valid").hide();

        $("div#summary .creatives .format .error").show();
        $("div#summary .creatives .format .value").hide();

        return false;
    } else {
        $("h4 a.creatives .error").hide();
        $("h4 a.creatives .valid").text(message);
        $("h4 a.creatives .valid").show();

        var errors = false;

        //make sure required creatives for each network have been uploaded
        if (values["network_string"].indexOf("network_nd") != -1) {
            //network_nd was chosen
            if (values["creatives"]["images"].indexOf("Text + Image (125x125)") != -1 && values["creatives"]["images"].indexOf("Banner") != -1) {
                //both creatives were uploaded
                //everything okay
            } else {
                errors = true;
            }
        }

        if (values["network_string"].indexOf("network_bsa") != -1) {
            //network_bsa was chosen
            if (values["creatives"]["images"].indexOf("Text + Image (130x100)") != -1) {
                //bsa ad was uploaded
                //everything okay
            } else {
                errors = true;
            }
        }

        if (errors) {
            $("div#summary .creatives .format .error").show();
            $("div#summary .creatives .format .value").hide();
        } else {
            $("div#summary .creatives .format .error").hide();
            $("div#summary .creatives .format .value").text(message);
            $("div#summary .creatives .format .value").show();
        }

        return true;
    }
}
