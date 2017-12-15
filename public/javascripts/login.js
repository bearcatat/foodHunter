$(document).ready(function(){
  $('.ui.form').form({
    fields:{
      phone_number : ['minLength[11]', 'empty','maxLength[11]']
    },
    onSuccess:function(e,fields){
      e.preventDefault();      
      $.ajax({
        type: 'POST',
        url: window.location.pathname,
        data: fields,
        success: function (s) {
          window.location=s.url;
        }
      })
    }
  })
})