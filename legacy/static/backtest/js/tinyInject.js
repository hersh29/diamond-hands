var script = document.createElement('script');
script.type = 'text/javascript';
script.src = "https://cdn.tiny.cloud/1/t2l0x6413ymlpq2ds7pujzr3ixbu0yqdsf9j8n4hzzm6jkfq/tinymce/7/tinymce.min.js";
document.head.appendChild(script);

script.onload = function () {
    tinymce.init({
        selector: "#id_description",
        height: 656,
        plugins: [
            'advlist autolink link image lists charmap print preview hr anchor pagebreak',
            'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
            'table emoticons template paste help'
        ],
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image | print preview media fullpage | ' +
            'forecolor backcolor emoticons | help',
        content_css: 'css/content.css',
        menubar: 'file edit view insert format tools table help',
        toolbar_drawer: 'floating',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        style_formats: [
            {
                title: 'Image Left',
                selector: 'img',
                styles: {
                    'float': 'left',
                    'margin': '0 10px 0 10px'
                }
            },
            {
                title: 'Image Right',
                selector: 'img',
                styles: {
                    'float': 'right',
                    'margin': '0 0 10px 10px'
                }
            }
        ]
    });
}