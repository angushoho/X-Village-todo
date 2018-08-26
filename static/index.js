// Whether Refresh the page after sending ajax requests
const Debug_Mode = false;
const BASE_URL = window.location.origin;
const API_URL = BASE_URL + '/record';
/**************************************************************
 * Supports
 **************************************************************/
function preventReload(e) {
    if (Debug_Mode) {
        e.preventDefault();
    }
}
/**************************************************************
 * Part 1: Initialize (GET Old Records)
 **************************************************************/
function generateDataHtml(data) {
    console.log('in generate data')
    let elementsHtml = '';
    for (let item of data) {
        let hide = 'd-flex';
        if(item['done'] === 1) {
            hide = 'hide';
        }
        const element =
            `
        <li data-record-id="${item['id']}" class="list-group-item  justify-content-between align-items-center ${hide}">
            <div>
                <span class="item-id">${item['id']}:</span> 
                <span class="item-title">${item['title']}</span>
            </div>
            <i data-record-id="${item['id']}" class="btnRemove far fa-trash-alt"></i>
            <i data-record-id="${item['id']}" class="btnCheck fas fa-check"></i>
            <!--<span data-record-title="${item['title']}" class="item-title badge badge-primary badge-pill">${item['title']}</span>-->
        </li>`;
        elementsHtml += element;
    }
    return elementsHtml;
}
/**
 * Append list html in <ul> element
 */
function loadAccountData(data) {
    const dataHtml = generateDataHtml(data);
    $('#mission-lists').append(dataHtml);
}
/**
 * Send GET requests to server to get purchase record from db
 */
function getItemsFromServer() {
    $.ajax({
        url: API_URL,
        method: 'GET',
        success: function (data) {
            loadAccountData(data)
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}
/**************************************************************
 * Part 2: Create New Record
 **************************************************************/
/**
 * Get Input Value (name & price) From html input area
 */
function getPostInputData() {
    const title = $('#post-item-title').val();
    return {
        'title': title,
        'done': 0
    }
}
/**
 * Send Post Request to create new purchase record
 */
function postItemToServer(inputData) {
    $.ajax({
        url: API_URL,
        method: 'POST',
        data: inputData,
        success: function (data) {
            console.log(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}
/**************************************************************
 * Part 3: Edit Record by id
 **************************************************************/
function showEditForm(recordId) {
    const recordElement = $(`.list-group-item[data-record-id='${recordId}'`);
    const oldName = recordElement.find('.item-title').text()
    // const oldCost = recordElement.children('.item-cost').attr('data-record-cost')
    // console.log(oldName)
    const formHtml
        = `
        <form data-record-id="${recordId}" id="put-form" class="d-flex justify-content-between align-items-center">
            <div class="input-group">
                <button data-record-id="${recordId}" class="btn btn-link btnCancel">X</button>
                <div class="input-group-prepend">
                    <span class="input-group-text">Title</span>
                </div>
                <input data-record-old-title="${oldName}" pattern=".{1,}" required title="1 characters minimum" type="text" aria-label="name" class="form-control" id="put-item-title" value="${oldName}">
                <button class="btn btn-link" type='submit'>Update</button>
            </div>
        </form>`;
    recordElement.html(formHtml);
    // Prevent Double click the li again
    recordElement.addClass('on-edit')
}
function cancelEditForm(recordId) {
    const recordElement = $(`.list-group-item[data-record-id='${recordId}'`);
    const oldName = recordElement.find('#put-item-title').attr('data-record-old-title');
    const element =
        `
            <div>
                <span class="item-id">${recordId}:</span> 
                <span class="item-title">${oldName}</span>
            </div>
            <i data-record-id="${recordId}" class="btnRemove far fa-trash-alt"></i>
            <!--<span data-record-title="${oldName}" class="item-title badge badge-primary badge-pill">${oldName}</span>-->
        `;
    recordElement.html(element);
    recordElement.removeClass('on-edit')
}
function getPutInputData(recordId) {
    const recordElement = $(`.list-group-item[data-record-id='${recordId}'`);
    const newTitle = recordElement.find('#put-item-title').val();
    return {
        id: recordId,
        title: newTitle
    }
}
function sendEditItemRequest(recordId) {
    const inputData = getPutInputData(recordId);
    $.ajax({
        url: `${API_URL}/${inputData['id']}`,
        method: 'PUT',
        data: inputData,
        success: function (data) {
            console.log(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}
function sendDoneRequest(recordId) {
    $.ajax({
        url: `${API_URL}/${recordId}/done`,
        method: 'PUT',
        data: {done: 1},
        success: function (data) {
            console.log(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });

}

/**************************************************************
 * Part 4: Remove Record by id
 **************************************************************/
function sendRemoveItemRequest(recordId) {
    $.ajax({
        url: `${API_URL}/${recordId}`,
        method: 'DELETE',
        success: function (data) {
            console.log(data);
            /*
            if (!Debug_Mode) {
                location.reload();
            }*/
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}
/**************************************************************
 * Part 5: Main Function (Event Listening)
 **************************************************************/
// Display past purchase records
getItemsFromServer()
/**
 * Listen: Form submit event (Create new record)
 */
$('#post-form').submit(function (e) {
    // prevent auto reload the page after sending request
    preventReload(e)
    const inputData = getPostInputData();
    // check inputData is valid
    if (inputData) {
        // create new record
        postItemToServer(inputData);
    }
});
/**
 * Listen: Remove icon Click event (Remove a old record)
 * Delegate Intro: http://jsgears.com/thread-402-1-1.html
 * Because the li elements is generated by js, we need to use delegate to bind all the remove buttons.
 */
$("body").delegate(".btnRemove", "click", function (e) {
    const recordId = $(this).attr('data-record-id');
    sendRemoveItemRequest(recordId);
    $("[data-record-id=" + recordId + "]").remove(".d-flex");
});
/**
 * Listen: Check icon Click event (mark a record as done)
 */
$("body").delegate(".btnCheck", "click", function (e) {
    const recordId = $(this).attr('data-record-id');
    sendDoneRequest(recordId);
    $("[data-record-id=" + recordId + "]").addClass("hide");
    $("[data-record-id=" + recordId + "]").removeClass("d-flex");
    // $("[data-record-id=" + recordId + "]").append(".hide");
});
/**
 * Listen: Done icon Click event (show done list)
 */
$("body").delegate("#done", "click", function (e) {
    $(".d-flex").hide();
    $(".d-flex").removeClass("d-flex");
    $(".hide").addClass("d-flex");
    $(".btnCheck").remove();
    // $(".hide").removeClass("hide");
    // $(".d-flex")

});
/**
 * Listen: Mission icon Click event (show mission list)
 */
$("body").delegate("#mission", "click", function (e) {
    // $(".d-flex").remove();
    $("#mission-lists").empty();
    getItemsFromServer();
});
/**
 * Listen: Double Click Event (Edit a old record)
 */
$("body").delegate(".list-group-item:not(.on-edit)", "dblclick", function (e) {
    const recordId = $(this).attr('data-record-id');
    // Prevent DBClick the example one
    if (recordId) {
        showEditForm(recordId)
    }
});
/**
 * Listen: Click Event (Cancel Update Record)
 */
$("body").delegate(".btnCancel", "click", function (e) {
    const recordId = $(this).attr('data-record-id');
    cancelEditForm(recordId)
});
/**
 * Listen: Click Event (Send Update Record Request)
 */
$("body").delegate("#put-form", "submit", function (e) {
    // prevent auto reload the page after sending request
    preventReload(e)
    const recordId = $(this).attr('data-record-id');
    sendEditItemRequest(recordId);
});