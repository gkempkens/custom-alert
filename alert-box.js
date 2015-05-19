/*********************************************
 **
 ** Alert-box: Overrides the default alert(msg) 
 **						box and adds a fallback _alert(msg)
 **						which triggers the browser default
 **						alert.
 **
 ** Requires: jQuery
 ** Author: Gerjan Kempkens
 **
 ** Examples:
		alert('alert this message!');
		alert('alert this message!', { header: { title: 'alert title'} });
		alert('alert this message!', { header: { title: 'alert title'}, footer: { buttons: [ { text:'close' } ] } });
		alert('alert this message!', { main: { class:'abox__box' }, header: { title: 'alert title'}, footer: { buttons: [ { text:'close', action:'_this.close()' } ] } });
		alert('alert this message!', { usecontainer: false, insidefirst:false, main: { cssclass:'abox__box-alt' }, header: { title: 'alert title'}, footer: { buttons: [ { text:'ok', action:'_this.close()', cssclass:'abox__btn', element:'button' }, { text:'cancel', action:'console.log("cancel")', element:'div' } ] } });
 **
 *********************************************/

// Capture the normal alert event, so we still can use this by calling _alert
(function () {
	_alert = window.alert;
})();

// Proxy the alert to the new AlertBox class.
(function (proxy) {
	proxy.alert = function () {
		// The alert can have 2 arguments, the message and options.
		var message = arguments[0];
		var options = arguments[1];

		// Creating a new AlertBox will automatically show it.
		new AlertBox(message, options);
	};
})(this);

// Extra setting definition, can be overriden on the page to set specific global settings.
AlertBoxSettings = {
	def : {
		button : {
			element: 'button',
			cssclass: 'abox__btn',
			container_cssclass: 'abox__buttons',
			default_text: 'ok'
		},
		container : {
			cssclass: 'abox__container'
		},
		addcontainer : {
			cssclass: 'abox__container-after'
		},
		box : {
			cssclass: 'abox__box',
			inner_cssclass: 'abox__inner',
			head_cssclass: 'abox__head',
			body_cssclass: 'abox__bd',
			body_alt_cssclass: 'abox__bd-alt',
			foot_cssclass: 'abox__foot',
			title_cssclass: 'abox__title'
		}
	}
};

/*********************************************
* Alertbox class, creates a new AlertBox
*********************************************/
function AlertBox(msg, options) {

	var cssStyle = [
		'.abox__container {background:rgb(0,0,0);background:rgba(0,0,0,0.5);-ms-filter:alpha(opacity=50);filter:alpha(opacity=50);position: fixed;top: 0;left: 0;right: 0;bottom: 0;}',
		'.abox__container-blank {background:transparent;position: absolute;top: 0;left: 0;right: 0;bottom: 0;}',
		'.abox__box {background-color: #FFFFFF;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px;-moz-box-shadow: 1px 1px 5px #000;-webkit-box-shadow: 1px 1px 5px #000;box-shadow: 1px 1px 5px #000;border:1px solid #ddd;display: block;height: 200px;left: 40%;position: absolute;top: 20%;width: 20%;}',
		'.abox__inner {height: 100%;position: relative;}',
		'.abox__head {border-bottom: 1px solid #DDDDDD;height: 20px;padding: 10px;}',
		'.abox__foot {border-top: 1px solid #DDDDDD;bottom: 0;height: 25px;left: 0;padding: 10px;position: absolute;right: 0;}',
		'.abox__bd {max-height: 133px;overflow-y: auto;padding: 10px;text-align: center;white-space: pre-wrap;}',
		'.abox__bd-alt {max-height: 93px;overflow-y: auto;padding: 10px;text-align: center;white-space: pre-wrap;}',
		'.abox__title {text-align: center;}',
		'.abox__buttons {float: right;}',
		'.abox__btn {float: left;margin: 0 5px;}'
	].join('');

	// Private Method which gets the container which holds the alertbox (or more).
	// returns The container. If none was present it creates a new container.
	this._getContainer = function () {
		var container = $('#' + this.alertContainerId);

		// when no container is present create it.
		if (typeof container == 'undefined' || container.length == 0) {
			// Add the style as inline style node to the head, this is done because you don't need to include a extra css file.
			$('head').prepend('<style>' + cssStyle + '</style>');
			// Add a new container to the body.
			$('body').append('<div id="' + this.alertContainerId + '" data-id="0" data-idx="9999"></div>');
			container = $('#' + this.alertContainerId);
			container.hide();
		}
		var containerClass = AlertBoxSettings.def.container.cssclass;
		if (this.options.usecontainer == false) {
			containerClass = 'abox__container-blank';
		}
		container.attr('class', containerClass);
		return container;
	};

	this._getAddContainer = function () {
		var container = this._getContainer();
		var addcontainer = $('#' + this.alertContainerId+'-after');

		// when no container is present create it.
		if (typeof addcontainer == 'undefined' || addcontainer.length == 0) {
			var addContainerClass = AlertBoxSettings.def.addcontainer.cssclass;
			container.after('<div id="' + this.alertContainerId + '-after" class="' + addContainerClass + '"></div>');
			addcontainer = $('#' + this.alertContainerId + '-after');
		}
		return addcontainer;
	}

	// Private Method which gets the box.
	// returns The created box.
	this._getBox = function () {
		// Get the container.
		var container = this._getContainer();
		var addcontainer = this._getAddContainer();
		// retrieve the id and idx from the container
		var dataId = Number(container.attr('data-id'));
		var dataIdx = Number(container.attr('data-idx'));
		// Set the current alertbox id.
		this.id = 'alertbox-' + dataId;

		var boxClass = AlertBoxSettings.def.box.cssclass;
		if (this.options.main && this.options.main.cssclass) {
			boxClass = this.options.main.cssclass;
		}
		// Set the start html with z-index.
		var boxHtml = '<div id="' + this.id + '" class="' + boxClass + ' js-alertbox" style="z-index:' + dataIdx + '"><div class="' + AlertBoxSettings.def.box.inner_cssclass + '">';
		// When there is a header add this, otherwise only the body.
		if (this._useHeader) {
			boxHtml += '<div class="' + AlertBoxSettings.def.box.head_cssclass + '">' + this._getTitleHtml(this.options.header) + '</div>';
			boxHtml += '<div class="' + AlertBoxSettings.def.box.body_alt_cssclass + '">' + this.msg + '</div>';
		} else {
			boxHtml += '<div class="' + AlertBoxSettings.def.box.body_cssclass + '">' + this.msg + '</div>';
		}
		// Add the button bar.
		boxHtml += '<div class="' + AlertBoxSettings.def.box.foot_cssclass + '">' + this._getButtonsHtml(this.options.footer) + '</div>';
		// Close the started html.
		boxHtml += '</div></div>';

		// Append the box to the container.
		if (this.options.insidefirst) {
			addcontainer.append(boxHtml);
		} else {
			container.append(boxHtml);
		}


		// Set the new id and idx for the next alertboxes.
		container.attr('data-id', dataId + 1);
		container.attr('data-idx', dataIdx - 1);

		// retrieve the newly added box and bind the actions.
		var box = $('#' + this.id);
		this._bindButtonActions(box);

		return box;
	};

	// Private Method which returns the title html for a given element.
	// returns The title html, otherwise an empty string.
	this._getTitleHtml = function (element) {
		if (element.title) {
			return '<div class="' + AlertBoxSettings.def.box.title_cssclass + '">' + element.title + '</div>';
		}
		return '';
	};

	// Private Method which returns the button htmk for a given element.
	// returns The button html, otherwise an empty string.
	this._getButtonsHtml = function (element) {
		var btnHtml = "";
		for (var i = 0; i < element.buttons.length; i++) {
			var btn = element.buttons[i];
			btn.id = i;
			if (!btn.element) {
				btn.element = AlertBoxSettings.def.button.element;
			}
			if (!btn.cssclass) {
				btn.cssclass = AlertBoxSettings.def.button.cssclass;
			}
			btnHtml += '<' + btn.element + ' class="' + btn.cssclass + ' js-alertbox-btn" data-id="' + btn.id + '">' + btn.text + '</' + btn.element + '>';
		}
		return '<div class="' + AlertBoxSettings.def.button.container_cssclass + '">' + btnHtml + '</div>';
	};

	// Private Method which creates a new button json element, for the given text and action.
	// param txt The text
	// param action The action
	// returns a new json button.
	this._getNewButton = function (txt, action) {
		var btn = {};
		btn.text = txt;
		btn.action = action;
		return btn;
	};

	// Private Method which binds the button actions for a given box.
	this._bindButtonActions = function (box) {
		var _this = this;
		// For each button, bind the action.
		for (var i = 0; i < this.options.footer.buttons.length; i++) {
			var btn = this.options.footer.buttons[i];
			box.find('.js-alertbox-btn[data-id=' + btn.id + ']').bind('click', function (ev) {
				var act = _this.options.footer.buttons[$(this).attr('data-id')].action;
				if (!act) {
					act = '_this.close()';
				}
				eval(act);
			});
		}
	};

	// Private Method to show the container and box.
	this._showBox = function () {
		var box = this._getBox();
		var container = this._getContainer();
		var addcontainer = this._getAddContainer();
		addcontainer.show();
		container.show();
	};

	// Public Method which closes the box (and removes it from the container)
	this.close = function () {
		$('#' + this.id).remove();
		var container = this._getContainer();
		var addcontainer = this._getAddContainer();
		// When there are no other boxes open, hide the container.
		if (addcontainer.find('.js-alertbox').length < 1) {
			container.hide();
			addcontainer.hide();
		}
	};

	////// GLOBAL settings of the Alert Box.

	this.alertContainerId = 'alertbox-container';
	this.id = -1;
	this.zIdx = -1;

	this.msg = msg;
	this._useHeader = options && options.header ? true : false;
	this._useFooter = options && options.footer ? true : false;

	// Make sure that the required jsonis available.
	if (typeof options == 'undefined') {
		options = {};
	}
	if (typeof options.footer == 'undefined') {
		options.footer = {};
	}
	if (typeof options.footer.buttons == 'undefined') {
		options.footer.buttons = [];
		// Create a default ok button when no buttons are defined.
		options.footer.buttons.push(this._getNewButton(AlertBoxSettings.def.button.default_text, '_this.close()'));
	}
	this.options = options;

	// Show the box.
	this._showBox();
}
