
$(window).on('load', function() {
    openModal();
});

function openModal() {
    
    var SESSION_KEY = 'EHDP-modal-timestamp';
    var TEST_TIME_DIFF = 1000 * 60 * 60 * 24; // ms * sec * min * hrs
    // var TEST_TIME_DIFF = 1000 * 10; // ms * sec
    
    if (localStorage) {

        // if session storage exists, see if there's a timestamp saved
        
        // console.log("'localStorage' exists");
        var session = localStorage.getItem(SESSION_KEY);
        
        if (session) {

            // if there's a timestamp saved, test the duration rule
            
            // console.log("'session' timestamp:", Number.parseFloat(session));
            // console.log("'now':", Date.now());
            // console.log("time difference:", Date.now() - session);
            // console.log("test duration:", TEST_TIME_DIFF);

            var actual_time_diff = Date.now() - session;
            
            if (actual_time_diff < TEST_TIME_DIFF) {

                // if it's within TEST_TIME_DIFF, don't show the modal
                
                $('#prototypeModal').modal('hide');
                
                // console.log(actual_time_diff + " < " + TEST_TIME_DIFF);
                // console.log("HIDE MODAL ='(");
                
            } else {

                // if it's outside of TEST_TIME_DIFF, show the modal
                
                $('#prototypeModal').modal('show');
                
                // console.log(actual_time_diff + " > " + TEST_TIME_DIFF);
                // console.log("SHOW MODAL! =)");
            }
            
        } else {

            // if there's no SESSION_KEY timestamp value, show the modal
            
            $('#prototypeModal').modal('show');
            
            // console.log("no 'session' timestamp");
            // console.log("SHOW MODAL! =)");
            
        }
        
    } else {
        
        // if no 'localStorage' available, show the modal

        $('#prototypeModal').modal('show');
            
        // console.log("no 'localStorage'");
        // console.log("SHOW MODAL! =)");

    }
    
    // update SESSION_KEY timestamp value on close/hide
    
    $('#prototypeModal').on('hide.bs.modal', function (e) {
        
        var date_now = Date.now();

        // console.log("hide modal & set new timestamp");
        // console.log("new timestamp:", date_now);
        
        if (localStorage) {
            localStorage.setItem(SESSION_KEY, date_now);
        }
        
    });
    
};