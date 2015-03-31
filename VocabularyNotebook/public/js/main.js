/* Your code starts here */

var app = {};
app.init = function() {
    //console.log('Your code starts here!');
    // deploy hash listener
    hashRouter();
    // Refresh hash
    location.hash = '';
    // check if user exists in localStorage
    if (localStorage['user']) {
        location.hash = '#words';
    } else {
        // render first page
        location.hash = '#register';
    }

};

// A function where we detect the change of '#' on the browser address field
var hashRouter = function() {
    $(window).off('hashchange').on('hashchange', function() {
        //console.log('Current hash is ' + location.hash);
        if (location.hash == '#register') {
            renderRegister();
        } else if (location.hash == '#words') {
            renderWords();
        } else if (location.hash == '#create') {
            var sentence = "Please add word.";
            renderCreate(sentence);
        }
        attachEvents();
    });
};

// A function where we keep all user's interaction listener (buttons, etc)
var attachEvents = function() {     
    //console.log('Attaching Events');

    // register page
    $('#btnRegister').off('click').on('click', function() {
        // Ajax call
        $.post('/register', {
            email: $('#iptEmailRegister').val()
        }, function(result) {
            // console.log(result.email);
            localStorage['user'] = result.email;
            //alert('Registered');
            // Assuming the email has been through the registeration process
            // and return to the user
            // the user may now proceed to the next page
            location.hash = '#words';
        });
    });
    // create button
    $('#btnCreate').off('click').on('click', function() {
        location.hash = '#create';
    });
    // submit button
    $('#btnSubmit').off('click').on('click', function() {
        $.ajax({
            url: '/word',
            type: 'POST',
            data: {
                user: localStorage['user'],
                p_title: $('#iptProjectTitle').val()
            },
            success: function(result) {
                // console.log(result);
                if(result.hasWord){
                    // console.log('has such word');
                    location.hash = '#words';
                } else {
                    // console.log('no such word');
                    var sentence = "Sorry there is no such word, please add another one.";
                    renderCreate(sentence);
                    attachEvents();
                }
            }
        });
    });
    // delete button
    $('.btnDelete').off('click').on('click', function() {
        var that = this;
        // delete item in database
        $.ajax({
            url: '/word',
            type: 'DELETE',
            data: {
                user: localStorage['user'],
                id: $(this).siblings().attr('data-id')
            },
            success: function(result) {
                // delete item in view
                $(that).parent().slideUp(function() {
                    location.reload();
                });
            }
        });
    });

    // update button
    $('.btnUpdate').off('click').on('click', function(){
        $.ajax({
            url: '/word',
            type: 'PUT',
            data: {
                user:  localStorage['user'],
                id: $(this).siblings().attr('data-id'),
                done: $('.btnUpdate').html()
            },
            success: function(result){
                // console.log("success!");
                // location.reload();
                renderWords();
                attachEvents();
            }
        });
    });

    // Log out --> localStorage.clear()
    $('#btnLogout').on('click', function() {
        localStorage.clear();
        location.hash = '#register';
    });
};

/*
	functions to render different pages
*/
var renderRegister = function() {
    // This is how we compile underscore template
    // Usually, it may be applied to other template brands as well
    var tplToCompile = $('#tpl_register').html();
    var compiled = _.template(tplToCompile, {
        title: 'Daily Vocabulary',
        date: new Date()
    });
    $('#view').html(compiled);
};

var renderWords = function() {
    // Fetch projects from database
    $.get('/words', {
        email: localStorage['user']
    }, function(results) {
        //console.log(results); // --> data
        var tplToCompile = $('#tpl_projects').html();
        var compiled = _.template(tplToCompile, {
            title: 'All Words',
            data: results.data,
            user: localStorage['user']
        });
        $('#view').html(compiled);
        //console.log('Projects rendered');
        //Because there is an Ajax(asynchronize) call above
        //attachEvents() may have already run in the hashRouter
        //but this function hasn't finished yet.
        //so there has to be an attachEvent() before the end of this function 
        attachEvents();
    });
};

var renderCreate = function(sentence) {
    // This is how we compile underscore template
    // Usually, it may be applied to other template brands as well
    var tplToCompile = $('#tpl_create').html();
    var compiled = _.template(tplToCompile, {
        title: 'Create',
        sentence: sentence,
        date: new Date()
    });
    $('#view').html(compiled);
};

app.init();