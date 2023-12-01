document.addEventListener('DOMContentLoaded', function () {
    const deleteBtns = document.querySelectorAll('.delete-btn');

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const productId = this.parentNode.querySelector('[name=productId]').value;
            const csrfToken = this.parentNode.querySelector('[name=_csrf]').value;

            const productElement = this.closest('.product-item');

            fetch('/admin/product/' + productId, {
                method: 'DELETE',
                headers: {
                    'csrf-token': csrfToken
                }
            }).then(result => {
                return result.json();
            }).then(data => {
                console.log(data);
                productElement.parentNode.removeChild(productElement);
            }).catch(err => {
                console.log(err);
            });
        });
    });

});