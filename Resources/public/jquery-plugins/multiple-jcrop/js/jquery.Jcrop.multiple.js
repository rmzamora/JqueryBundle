/**
 * jquery.Jcrop.multiple.js v0.0.1
 * Work based on jQuery Image Cropping Plugin by Kelly Hallman <khallman@gmail.com>
 *
 * Author: Nil Portugués Calderó <contact@nilportugues.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */

$(function()
{
	options = new Array();

	//Jcrop Image Presentation CSS
	options['row'] 				= '.jcrop-item';
	options['image'] 			= '.jcrop-box';
	options['imagePreview'] 		= '.jcrop-preview';
	options['imagePreviewPane'] 		= '.jcrop-preview-pane';
	options['imagePreviewContainer'] 	= '.jcrop-preview-container';

	//JCrop Form CSS Selector
	options['formNewImageSourceField']	= '.jcrop-image';
	options['formSourceField'] 		= '.jcrop-src';
	options['formCropXField'] 		= '.jcrop-x';
	options['formCropYField'] 		= '.jcrop-y';
	options['formCropX2Field']		= '.jcrop-x2';
	options['formCropY2Field'] 		= '.jcrop-y2';

	//JCrop HTML5 Data Attributes configurations
	options['dataAttrWidthField'] 		= 'data-width';
	options['dataAttrHeightField'] 		= 'data-height';
	options['dataAttrXField'] 		= 'data-x';
	options['dataAttrYField'] 		= 'data-y';
	options['dataAttrX2Field']		= 'data-x2';
	options['dataAttrY2Field'] 		= 'data-y2';

    	//KCFinder integration
    	options['KCFinder'] 		        = '.kcfinder-open';
    	options['KCFinderURL'] 		        = 'data-kcfinder';
    
	JCropSetUp(options);
});

function JCropSetUp(opt)
{
	var options = opt;
	$(options['row']).each(function(i, obj) 
	{	
		// Save the current object for later use.
		var currentObj = $(this);

		// Build the Preview pane.
		var jcrop_preview_src = currentObj.find(options['image']).attr('src');	

		currentObj.find(options['imagePreview'])
			  .attr('src',jcrop_preview_src);

		currentObj.find(options['imagePreviewContainer'])
			  .css('height',currentObj.find(options['imagePreview'])
			  .attr(options['dataAttrHeightField'])+'px');

		currentObj.find(options['imagePreviewContainer'])
			  .css('width',currentObj.find(options['imagePreview'])
			  .attr(options['dataAttrWidthField'])+'px');

		// Create variables (in this scope) to hold the API and image size
		var jcrop_api;
		var boundx;
		var boundy;

		// Grab some information about the preview pane
		var $preview = currentObj.find(options['imagePreviewPane']);
		var $pimg = currentObj.find(options['imagePreviewPane']+' '+options['imagePreviewContainer']+' img');
		var $pcnt = currentObj.find(options['imagePreviewPane']+' '+options['imagePreviewContainer']);	
		var xsize = $pcnt.width();
		var ysize = $pcnt.height();

		// Build form image src hidden attribute
		currentObj.find(options['formSourceField'])
			  .attr('value',jcrop_preview_src);

		// Grab some information about the Main pane
		var jcrop_w = currentObj.find(options['image'])
					.attr(options['dataAttrWidthField']);

		var jcrop_h = currentObj.find(options['image'])
					.attr(options['dataAttrHeightField']);			

		// Build the Main pane
		currentObj.find(options['image']).Jcrop
		(
			{
				boxWidth: jcrop_w,
				boxHeight:  jcrop_h,
				onChange: updatePreview,
				onSelect: updateCoords,
				aspectRatio: xsize / ysize,
				addClass: 'jcrop-transparent-bg'
			},
			function()
			{
				// Use the API to get the real image size
				bounds = this.getBounds();
				boundx = bounds[0];
				boundy = bounds[1];

				// Store the API in the jcrop_api variable
				jcrop_api = this;
				
				//Reload selection, if array is not null
				setCoords = recoverSelect();
				if(setCoords != false)
				{					
					jcrop_api.setSelect(setCoords);
				}

				// Move the preview into the jcrop container for css positioning
				$preview.appendTo(jcrop_api.ui.holder);
			}
		);

		//This will let us change on the fly the image to resize.
		$(options['formNewImageSourceField']).on('change click',function(event)
		{	
			url = currentObj.find(options['formSourceField']).attr('value');
			
			//KCFinder case
			if( $(this).val() == '' && $(this).attr(options['KCFinderURL']) )
            		{
                		$(this).val(url);
            		}
			//"Normal" case
			else
			{
				url = $(this).val();
			}            
            
			if(url != '')
			{						
		                //Reset the selected image areas
		                currentObj.find(options['formCropXField']).val('');
		                currentObj.find(options['formCropYField']).val('');
		                currentObj.find(options['formCropX2Field']).val('');
		                currentObj.find(options['formCropY2Field']).val('');
                
				//Set new image 
				currentObj.find(options['image']).attr('src',url);
				currentObj.find(options['imagePreview']).attr('src',url);	
				currentObj.find(options['formSourceField']).attr('value',url);
	
				// Set the new size.		
				currentObj.find(options['image']).css('height','').css('width','');
	
				newh = currentObj.find(options['image']).height();
				neww = currentObj.find(options['image']).width();
	
				$pimg.css(
				{
					  width: neww + 'px',
					  height: newh + 'px',
					  marginLeft: '0',
					  marginTop: '0'
				});
	
				//Load the new image
				jcrop_api.setImage(url,function()
				{
					// Use the API to get the real image size
					bounds = this.getBounds();
					boundx = bounds[0];
					boundy = bounds[1];
	
					// Store the API in the jcrop_api variable
					jcrop_api = this;
	
					// Move the preview into the jcrop container for css positioning
					$preview.appendTo(jcrop_api.ui.holder);
				});			
			}
			event.preventDefault();
		});

		/**
		 * Reloads the image reading the coordinates from attr attributes.	
		 */
		function recoverSelect()
		{
			x = parseInt(currentObj.find(options['image']).attr(options['dataAttrXField']));
			y = parseInt(currentObj.find(options['image']).attr(options['dataAttrYField']));
			x2 = parseInt(currentObj.find(options['image']).attr(options['dataAttrX2Field']));
			y2 = parseInt(currentObj.find(options['image']).attr(options['dataAttrY2Field']));
			
			if(isNaN(x))
			{
				return false;
			}
			else{
				var rx = xsize / x2;
				var ry = ysize / y2;

				$pimg.css({
				  width: Math.round(rx * boundx) + 'px',
				  height: Math.round(ry * boundy) + 'px',
				  marginLeft: '-' + Math.round(rx * x) + 'px',
				  marginTop: '-' + Math.round(ry * y) + 'px'
				});
				return [ x,y,x2,y2 ];				
			}			
		}

		/**
		 * Updates the preview pane for the current instance.
		 */
		function updatePreview(c)
		{
			if (parseInt(c.w) > 0)
			{
				var rx = xsize / c.w;
				var ry = ysize / c.h;

				$pimg.css({
				  width: Math.round(rx * boundx) + 'px',
				  height: Math.round(ry * boundy) + 'px',
				  marginLeft: '-' + Math.round(rx * c.x) + 'px',
				  marginTop: '-' + Math.round(ry * c.y) + 'px'
				});
			}
		};

		/**
		 * Updates the coordinates for the current form instance.
		 */
		function updateCoords(c)
		{				
			currentObj.find(options['formCropXField']).val(Math.round(c.x));
			currentObj.find(options['formCropYField']).val(Math.round(c.y));
			currentObj.find(options['formCropX2Field']).val(Math.round(c.w));
			currentObj.find(options['formCropY2Field']).val(Math.round(c.h));
			updatePreview(c);
		};
		
		
	        //INTEGRATION WITH KCFINDER
	        $(options['KCFinder']).on('click',function()
	        {
	            window.KCFinder =
	            {
	                callBack: function(url)
	                {
	                    $(options['formSourceField']).attr('value','http:'+url);
	                    window.KCFinder = null;
	                    $(options['formNewImageSourceField']).trigger('click');
	                }
	            };
	            window.open
	            (
	                $(options['KCFinder']).attr(options['KCFinderURL']),
	                'kcfinder_textbox',
	                'status=0, toolbar=0, location=0, menubar=0, directories=0, resizable=1, scrollbars=0, width=800, height=600'
	            );
        })		
	});
}
