(function(){

	var selectedText;

	var button = new TurengButton();
	
	var overlay = new TurengOverlay();
	
	var dialog = new TurengDialog();
	
	var modal = new TurengModal();

    var close = function()
    {
        modal.empty();

        dialog.empty();

        overlay.empty().hide();
    };

    button.getContext().addEventListener("mouseup", function(event){

        event.stopPropagation();

    });
	
	button.getContext().addEventListener("click", function(event){

        event.preventDefault();

        event.stopPropagation();

		button.hide();
		
		overlay.show();
		
		dialog.loading().appendTo(overlay.getContent());

        chrome.runtime.sendMessage({selectedText: selectedText}, function(xhttp) {
	
			dialog.remove();
						
			if ( xhttp.status !== 200 )
			{
				dialog.message("Bir şeyler yolunda gitmedi.").appendTo(overlay.getContent());
			}
			
			else
			{
                var doc = new DOMParser().parseFromString(xhttp.responseText, "text/html");

                var tables = doc.getElementsByClassName("searchResultsTable");

                var total = 0;

                var elements = [];

                Array.prototype.slice.call(tables).forEach(function(table){

                    var response = {};

                    Array.prototype.slice.call(table.querySelectorAll("tr")).forEach(function(elem){

                        var englishColumn = elem.querySelector("td[lang=en]");

                        var turkishColumn = elem.querySelector("td[lang=tr]");

                        var categoryColumn;

                        if ( englishColumn && turkishColumn )
                        {
                            var englishIndex = Array.prototype.indexOf.call(englishColumn.parentNode.children, englishColumn);

                            var turkishIndex = Array.prototype.indexOf.call(turkishColumn.parentNode.children, turkishColumn);

                            var insertObject = {};

                            var englishColumnLink = englishColumn.querySelector("a");

                            englishColumnLink.setAttribute("target", "_blank");

                            englishColumnLink.setAttribute("href", "http://tureng.com" + englishColumnLink.getAttribute("href"));

                            var turkishColumnLink = turkishColumn.querySelector("a");

                            turkishColumnLink.setAttribute("target", "_blank");

                            turkishColumnLink.setAttribute("href", "http://tureng.com" + turkishColumnLink.getAttribute("href"));

                            if ( englishIndex < turkishIndex )
                            {
                                categoryColumn = englishColumn.previousElementSibling;

                                insertObject.first = englishColumnLink.outerHTML;

                                insertObject.second = turkishColumnLink.outerHTML;
                            }
                            else
                            {
                                categoryColumn = turkishColumn.previousElementSibling;

                                insertObject.first = turkishColumnLink.outerHTML;

                                insertObject.second = englishColumnLink.outerHTML;
                            }

                            insertObject.purpose = englishColumn.querySelector("i").innerText;

                            var category = categoryColumn.innerText.trim();

                            if ( !response.hasOwnProperty(category) )
                            {
                                response[category] = new Array();
                            }

                            response[category].push(insertObject);

                            total++;
                        }

                    });

                    elements.push(response);

                });

                if ( total )
                {
                    modal.render(selectedText, total, elements).appendTo(overlay.getContent());
                }
                else
                {
                    dialog.message("Hiçbir sonuç bulunamadı.").appendTo(overlay.getContent());
                }
			}
			
		});

	});
		
	overlay.getContext().addEventListener("click", function(event){

        event.stopPropagation();

        close();
		
	});

    overlay.getContext().addEventListener("keydown", function(event){

        event.stopPropagation();

        if (event.keyCode == 27 )
        {
            close();
        }

    });

    overlay.getContext().addEventListener("keyup", function(event){

        event.stopPropagation();

    });

	modal.getContext().addEventListener("click", function(event){
	
		event.stopPropagation();
	
	});

    dialog.getContext().addEventListener("click", function(event){

        event.stopPropagation();

    });
	
	document.addEventListener("mouseup", function(){

        if ( overlay.isOpened() ) return;
	
		var selection = window.getSelection();
		
		selectedText = selection.toString().trim();

		if ( selectedText.length )
		{
			var range = selection.getRangeAt(0);
			
			var rects = range.getClientRects();
		
			if ( rects.length )
			{
                button.move(rects).show();

				return;
			}
		}
		
		button.hide();
		
	});

})();