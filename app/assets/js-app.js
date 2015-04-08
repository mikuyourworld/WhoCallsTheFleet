// node.js modules
	node.require('fs')
	node.require('nedb')
	node.require('path')
	node.require('mkdirp')





// Global Variables
	_g.animate_duration_delay = 320;
	_g.execPath = node.path.dirname(process.execPath)
	_g.inputIndex = 0
	_g.lang = 'zh_cn'

	_g.path = {
		'db': 		process.cwd() + '/data/',
		'pics': {
			'ships': 	process.cwd() + '/pics/ships/',
			'items': 	process.cwd() + '/pics/items/'
		}/*,
		'illustrations': {
			'ships': 	_g.execPath + '/illust/ships/',
			'items': 	_g.execPath + '/illust/items/'
		}*/
	}

	_g.pathMakeObj = function(obj){
		for( var i in obj ){
			if( typeof obj[i] == 'object' ){
				_g.pathMakeObj( obj[i] )
			}else{
				node.mkdirp.sync( obj[i] )
			}
		}
	}
	_g.pathMakeObj( _g.path )

	_g.data = {
		'entities': {},

		'items': {},
		'item_types': {},

		'ships': {},
		'ship_id_by_type': [], 			// refer to _g.ship_type_order
		'ship_types': {},
		'ship_classes': {}
	}

	var _db = {
		'entities': new node.nedb({
				filename: 	_g.path.db + '/entities.json'
			}),

		'items': new node.nedb({
				filename: 	_g.path.db + '/items.json'
			}),
		'item_types': new node.nedb({
				filename: 	_g.path.db + '/item_types.json'
			}),
		'item_type_collections': new node.nedb({
				filename: 	_g.path.db + '/item_type_collections.json'
			}),

		'ships': new node.nedb({
				filename: 	_g.path.db + '/ships.json'
			}),
		'ship_types': new node.nedb({
				filename: 	_g.path.db + '/ship_types.json'
			}),
		'ship_type_collections': new node.nedb({
				filename: 	_g.path.db + '/ship_type_collections.json'
			}),
		'ship_type_order': new node.nedb({
				filename: 	_g.path.db + '/ship_type_order.json'
			}),
		'ship_classes': new node.nedb({
				filename: 	_g.path.db + '/ship_classes.json'
			}),
		'ship_series': new node.nedb({
				filename: 	_g.path.db + '/ship_series.json'
			}),
		'ship_namesuffix': new node.nedb({
				filename: 	_g.path.db + '/ship_namesuffix.json'
			})
	}
	_g.ship_type_order = []
	_g.ship_type_order_map = {}
















// Global Functions
	_g.statSpeed = {
		5: 	'低速',
		10: '高速'
	}
	_g.statRange = {
		1: 	'短',
		2: 	'中',
		3: 	'长',
		4: 	'超长'
	}
	_g.getStatSpeed = function( speed ){
		speed = parseInt(speed)
		return _g.statSpeed[speed]
	}
	_g.getStatRange = function( range ){
		range = parseInt(range)
		return _g.statRange[range]
	}
	_g.getName = function( nameObj, joint, lang ){
		joint = joint || ''
		if( !nameObj )
			return null
		return (
				nameObj[ _g.lang ] || nameObj['ja_jp']
				) + (
				nameObj.suffix ? (
						joint + (
								_g.data['ship_namesuffix'][nameObj.suffix][ _g.lang ] || _g.data['ship_namesuffix'][nameObj.suffix]['ja_jp']
							)
					) : ''
				)
	}
















// Global Frame
_frame.app_main = {
	page: {},
	page_dom: {},

	// is_init: false
	bgimg_dir: 	'./app/assets/images/homebg',
	bgimgs: 	[],
	// cur_bgimg_el: null

	// cur_page: null

	// 尚未载入完毕的内容
		loading: [
			'dbs',
			'bgimgs',
			'db_namesuffix'
		],
		// is_loaded: false,

	// 载入完毕一项内容，并检查其余内容是否载入完毕
	// 如果全部载入完毕，#layout 添加 .ready
		loaded: function( item, is_instant ){
			_frame.app_main.loading.splice(_frame.app_main.loading.indexOf(item), 1)
			if( !_frame.app_main.loading.length && !_frame.app_main.is_loaded ){
				setTimeout(function(){
					if( _frame.app_main.is_loaded )
						_frame.dom.layout.addClass('ready')
				}, is_instant ? 300 : 1000)
				// 绑定onhashchange事件
					$window.on('hashchange.pagechange', function(){
						_frame.app_main.load_page_func(_g.uriHash('page'))
					})

				_frame.app_main.load_page_func(_g.uriHash('page'))
				_frame.app_main.is_loaded = true
			}
		},


	// 更换背景图
		//change_bgimg_fadein: false,
		change_bgimg: function( bgimgs_new ){
			// _frame.app_main.bgimgs 未生成，函数不予执行
			if( !_frame.app_main.bgimgs.length )
				return false

			var bgimgs = bgimgs_new && bgimgs_new.length ? bgimgs_new : _frame.app_main.bgimgs
				,img_new = bgimgs[_g.randInt(bgimgs.length)]
				,img_old = _frame.app_main.cur_bgimg_el ? _frame.app_main.cur_bgimg_el.css('background-image') : null

			img_old = img_old ? img_old.split('/') : null
			img_old = img_old ? img_old[img_old.length - 1].split(')') : null
			img_old = img_old ? img_old[0] : null

			while( img_new == img_old ){
				img_new = bgimgs[_g.randInt(bgimgs.length - 1)]
			}

			var img_new_blured = '.' + _frame.app_main.bgimg_dir + '/blured/' + img_new
			img_new = '.' + _frame.app_main.bgimg_dir + '/' + img_new

			function delete_old_dom( old_dom ){
				setTimeout(function(){
					old_dom.remove()
				}, _g.animate_duration_delay)
			}

			if( img_old ){
				delete_old_dom( _frame.app_main.cur_bgimg_el )
			}

			//_frame.app_main.cur_bgimg_el = $('<img src="' + img_new + '" />').appendTo( _frame.dom.bgimg )
			_frame.app_main.cur_bgimg_el = $('<div/>').css('background-image','url('+img_new+')').appendTo( _frame.dom.bgimg )
											.add( $('<s'+( _frame.app_main.change_bgimg_fadein ? ' class="fadein"' : '' )+'/>').css('background-image','url('+img_new_blured+')').appendTo( _frame.dom.nav ) )
											.add( $('<s'+( _frame.app_main.change_bgimg_fadein ? ' class="fadein"' : '' )+'/>').css('background-image','url('+img_new_blured+')').appendTo( _frame.dom.main ) )

			_frame.app_main.change_bgimg_fadein = true
		},





	// 隐藏内容，只显示背景图
		toggle_hidecontent: function(){
			_frame.dom.layout.toggleClass('hidecontent')
		},





	// 更换页面
		load_page: function( page ){
			_g.uriHash('page', page)
		},
		load_page_func: function( page ){
			if( _frame.app_main.cur_page == page || !page )
				return page

			if( !_frame.app_main.page_dom[page] ){
				_frame.app_main.page_dom[page] = $('<div class="page" page="'+page+'"/>').appendTo( _frame.dom.main )
				node.fs.readFile('./app/page/' + page + '.html', 'utf8', function(err, data){
					if(err)
						throw err
					_frame.app_main.page_dom[page].html( data )
					if( _frame.app_main.page[page] && _frame.app_main.page[page].init )
						_frame.app_main.page[page].init(_frame.app_main.page_dom[page])
					_p.initDOM(_frame.app_main.page_dom[page])
				})
			}

			_frame.app_main.page_dom[page].removeClass('off')

			// 关闭之前的页面
				if( _frame.app_main.cur_page ){
					_frame.dom.navs[_frame.app_main.cur_page].removeClass('on')
					_frame.app_main.page_dom[_frame.app_main.cur_page].addClass('off')
				}

			_frame.dom.navs[page].addClass('on')

			if( _frame.dom.layout.hasClass('ready') )
				_frame.app_main.change_bgimg()

			_frame.app_main.cur_page = page
		},






	init: function(){
		if( _frame.app_main.is_init )
			return true

		// 创建基础框架
			_frame.dom.nav = $('<nav/>').appendTo( _frame.dom.layout )
				_frame.dom.logo = $('<button class="logo" />')
									.on({
										'animationend, webkitAnimationEnd': function(e){
											$(this).addClass('ready-animated')
										}
									})
									.appendTo( _frame.dom.nav )
				/*
				_frame.dom.logo = $('<button class="logo" />').on('click', function(){
										_frame.app_main.toggle_hidecontent()
									})
									.html('<strong>' + node.gui.App.manifest['name'] + '</strong><b>' + node.gui.App.manifest['name'] + '</b>')
									.on({
										'animationend, webkitAnimationEnd': function(e){
											$(this).addClass('ready-animated')
										}
									})
									.appendTo( _frame.dom.nav )
				*/
				_frame.dom.navlinks = $('<div/>').appendTo( _frame.dom.nav )
			_frame.dom.main = $('<main/>').appendTo( _frame.dom.layout )
			_frame.dom.bgimg = $('<div class="bgimg" />').appendTo( _frame.dom.layout )

		// 创建主导航
			function navLink(page){
				return $('<button />').on('click', function(){
						_frame.app_main.load_page(page)
					})
			}
			if( _frame.app_main.nav && _frame.app_main.nav.length ){
				_frame.dom.navs = {}
				for( var i in _frame.app_main.nav ){
					var o = _frame.app_main.nav[i]
					_frame.dom.navs[o.page] = navLink(o.page).html(o.title).appendTo( _frame.dom.navlinks )
					if( i == 0 && !_g.uriHash('page') ){
						_frame.dom.navs[o.page].trigger('click')
					}
				}
			}

		// 获取背景图列表，生成背景图
			node.fs.readdir(_frame.app_main.bgimg_dir, function(err, files){
				var bgimgs_last = _config.get('bgimgs')
					,bgimgs_new = []
				bgimgs_last = bgimgs_last ? bgimgs_last.split(',') : []
				for( var i in files ){
					var lstat = node.fs.lstatSync(_frame.app_main.bgimg_dir + '/' + files[i])
					if( !lstat.isDirectory() ){
						_frame.app_main.bgimgs.push( files[i] )

						// 存在bgimgs_last：直接比对
						// 不存在bgimgs_last：比对每个文件，找出最新者
						if( bgimgs_last.length ){
							if( $.inArray( files[i], bgimgs_last ) < 0 )
								bgimgs_new.push( files[i] )
						}else{
							var mtime = parseInt(lstat.mtime.valueOf())
							if( bgimgs_new.length ){
								if( mtime > bgimgs_new[1] )
									bgimgs_new = [ files[i], mtime ]
							}else{
								bgimgs_new = [ files[i], mtime ]
							}
						}
					}
				}
				if( !bgimgs_last.length )
					bgimgs_new.pop()
				_config.set(
					'bgimgs',
					_frame.app_main.bgimgs
				)
				_frame.app_main.change_bgimg( bgimgs_new );
				_frame.app_main.loaded('bgimgs')
				//if( !_g.uriHash('page') )
				//	_frame.app_main.load_page( _frame.app_main.nav[0].page )
				//setTimeout(function(){
				//	_frame.dom.layout.addClass('ready')
				//}, 1000)
			})

		// 读取db
			//var _db_size = 0
			//	,_db_loaded = 0
			var _db_toload = []
			for( var i in _db ){
				//_db_size++
				_db_toload.push(i)
			}
			function _db_load(){
				var db_name = _db_toload[0]
				_db_toload.shift()

				function _db_load_next(){
					//if( _db_loaded >= _db_size )
					if( _db_toload.length )
						setTimeout(function(){
							_db_load()
						}, 50)
					else
						setTimeout(function(){
							_frame.app_main.loaded('dbs')
						}, 500)
				}

				_db[db_name].loadDatabase(function(err){
					if( err ){
					}else{
						//_db_loaded++

						switch( db_name ){
							/*
							case 'entities':
							case 'items':
							case 'item_types':
							case 'ship_classes':
							case 'ship_types':
								_db[db_name].find({}, function(err, docs){
									if( typeof _g.data[db_name] == 'undefined' )
										_g.data[db_name] = {}
									for(var i in docs ){
										_g.data[db_name][docs[i]['id']] = docs[i]
									}
									_db_load_next()
								})
								break;
								*/
							case 'ship_namesuffix':
								_db.ship_namesuffix.find({}).sort({ 'id': 1 }).exec(function(err, docs){
									_g.data.ship_namesuffix = [{}].concat(docs)
									_frame.app_main.loaded('db_namesuffix')
									_db_load_next()
								})
								break;
							case 'ship_type_order':
								// ship type -> ship order
								function map_do(){
									for( var i in _g.ship_type_order ){
										var index = parseInt(i)
										if( typeof _g.ship_type_order[i] == 'object' ){
											for( var j in _g.ship_type_order[i] ){
												_g.ship_type_order_map[ _g.ship_type_order[i][j] ] = index
											}
										}else{
											_g.ship_type_order_map[ _g.ship_type_order[i] ] = index
										}
									}
								}
								_db.ship_type_order.find({}).sort({'id': 1}).exec(function(err, docs){
									for(var i in docs ){
										_g.ship_type_order.push(
											docs[i]['types'].length > 1 ? docs[i]['types'] : docs[i]['types'][0]
										)
									}
									map_do()
									_db.ships.find({}).sort({'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1}).exec(function(err, docs){
										for(var i in docs){
											_g.data.ships[docs[i]['id']] = docs[i]

											if( typeof _g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] == 'undefined' )
												_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] = []
											_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ].push( docs[i]['id'] )
										}
										_db_load_next()
									})
								})
								break;
							default:
								_db[db_name].find({}, function(err, docs){
									if( typeof _g.data[db_name] == 'undefined' )
										_g.data[db_name] = {}
									for(var i in docs ){
										_g.data[db_name][docs[i]['id']] = docs[i]
									}
									_db_load_next()
								})
								break;
						}
							
					}
				})
			}
			//for( var i in _db ){
			//	_db_load(i)
			//}
			_db_load()

		// 部分全局事件委托
		/*
			$html.on('click.openShipModal', '[data-shipid][modal="true"]', function(e){
				if( !(e.target.tagName.toLowerCase() == 'input' && e.target.className == 'compare') ){
					if( $(this).data('shipedit') ){
						try{
							//_frame.app_main.page['ships'].show_ship_form( _g.data.ships[ $(this).data('shipid') ] )
						}catch(err){}
					}else{
						try{
							_frame.app_main.show_ship( _g.data.ships[ $(this).data('shipid') ] )
						}catch(err){}
					}
				}
			})
		*/

		_frame.app_main.is_init = true
	}
}
























// Modal: Ship
/*
	_frame.app_main.show_ship = function( d ){
		function _val( val, show_zero ){
			if( !show_zero && (val == 0 || val == '0') )
				return '<small class="zero">-</small>'
			if( val == -1 || val == '-1' )
				return '<small class="zero">?</small>'
			return val
		}

		_frame.modal.resetContent()

		if( debugmode )
			console.log(d)

		var dom = $('<div class="ship"/>')

		// 图鉴
			var illusts = $('<div class="illustrations"/>')
							.append(
								$('<img src="' + _g.path.pics.ships + '/' + d['id'] + '/2.jpg' + '"/>')
							)
							.appendTo(dom)

		// 舰种&舰级
			$('<small/>')
				.html(
					( d['class'] ? _g['data']['ship_classes'][d['class']]['name_zh'] + '级' : '' )
						+ ( d['class_no'] ? '<em>' + d['class_no'] + '</em>号舰' : '' )
						+ ( d['type'] ? '<br/>' + _g['data']['ship_types'][d['type']]['full_zh'] : '' )
				)
				.appendTo(dom)

		// 默认装备&搭载数
			var equips = $('<div class="equipments"/>').appendTo(dom)
				,i = 0
			while( i < 4 ){
				var equip = $('<button/>').appendTo(equips)
					,icon = $('<i/>').appendTo( equip )
					,name = $('<small/>').appendTo( equip )
					,slot = $('<em/>').appendTo( equip )

				if( typeof d['slot'][i] == 'undefined' ){
					equip.addClass('no')
				}else if( typeof d['equip'][i] == 'undefined' || !d['equip'][i] || d['equip'][i] === '' ){
					equip.addClass('empty')
					name.html( '--未装备--' )
					slot.html( d['slot'][i] )
				}else{
					var item_data = _g.data.items[d['equip'][i]]
						,item_icon = 'assets/images/itemicon/'
										+ _g.data.item_types[item_data['type']]['icon']
										+ '.png'
					function _stat(stat, title){
						if( item_data['stat'][stat] ){
							switch(stat){
								case 'range':
									return '<span>射程: ' + _g.getStatRange( item_data['stat'][stat] ) + '</span>';
									break;
								default:
									var val = parseInt( item_data['stat'][stat] )
									return '<span>' + ( val > 0 ? '+' : '') + val + ' ' + title + '</span>'
									break;
							}
						}else{
							return ''
						}
					}
					equip.attr({
						'data-itemid': 	d['equip'][i],
						'data-tip':		'<h3 class="itemstat">'
											+ '<s style="background-image: url(' + item_icon + ')"></s>'
											+ '<strong data-content="' + item_data['name']['zh_cn'] + '">'
												+ item_data['name']['zh_cn']
											+ '</strong>'
											+ '<small>' + _g.data.item_types[item_data['type']]['name']['zh_cn'] + '</small>'
										+ '</h3>'
										+ _stat('fire', '火力')
										+ _stat('torpedo', '雷装')
										+ _stat('aa', '对空')
										+ _stat('asw', '对潜')
										+ _stat('bomb', '爆装')
										+ _stat('hit', '命中')
										+ _stat('armor', '装甲')
										+ _stat('evasion', '回避')
										+ _stat('los', '索敌')
										+ _stat('range', '射程')
					})
					name.html(
						item_data['name']['zh_cn'].replace(/（([^（^）]+)）/g, '<small>($1)</small>')
					)
					slot.html( d['slot'][i] )
					icon.css(
						'background-image',
						'url(' + item_icon + ')'
					)
				}
				i++
			}

		// 属性
			var stat1 = $('<div class="stats"/>').appendTo(dom)
				,stat2 = $('<div class="stats"/>').appendTo(dom)
				,stat3 = $('<div class="stats"/>').appendTo(dom)
				,stat_consum = $('<div class="stats consum"/>').html('<strong>消耗</strong>').appendTo(dom)
			function _add_stat( name, title, val, tar ){
				$('<span/>')
					.html(
						'<small class="stat-'+name+'">' + title + '</small>'
						+ '<em>' + val + '</em>'
					)
					.appendTo(tar)
			}
			_add_stat( 'hp', 		'耐久', _val( d['stat']['hp'] ), 			stat1 )
			_add_stat( 'armor', 	'装甲', _val( d['stat']['armor_max'] ),		stat1 )
			_add_stat( 'evasion', 	'回避', _val( d['stat']['evasion_max'] ),	stat1 )
			_add_stat( 'carry', 	'搭载', _val( d['stat']['carry'] ),			stat1 )

			_add_stat( 'fire', 		'火力', _val( d['stat']['fire_max'] ),		stat2 )
			_add_stat( 'torpedo', 	'雷装', _val( d['stat']['torpedo_max'] ),	stat2 )
			_add_stat( 'aa', 		'对空', _val( d['stat']['aa_max'] ),		stat2 )
			_add_stat( 'asw', 		'对潜', _val( d['stat']['asw_max'], /^(5|8|9|12)$/.test( d['type'] ) ),		stat2 )

			_add_stat( 'speed', 	'航速', _g.getStatSpeed( d['stat']['speed'] ),		stat3 )
			_add_stat( 'range', 	'射程', _g.getStatRange( d['stat']['range'] ),		stat3 )
			_add_stat( 'los', 		'索敌', _val( d['stat']['los_max'] ),		stat3 )
			_add_stat( 'luck', 		'运', 	d['stat']['luck'] + '<sup>' + d['stat']['luck_max'] + '</sup>',		stat3 )

			_add_stat( 'fuel', 		'', _val( d['consum']['fuel'] ),		stat_consum )
			_add_stat( 'ammo', 		'', _val( d['consum']['ammo'] ),		stat_consum )

		// 声优&画师_g.data.entities
			$('<div class="entity"/>')
				.html(
					'<strong>声优</strong>'
					+ '<span>' + _g['data']['entities'][d['rels']['cv']]['name'][_g.lang] + '</span>'
				)
				.appendTo(dom)
			$('<div class="entity"/>')
				.html(
					'<strong>画师</strong>'
					+ '<span>' + _g['data']['entities'][d['rels']['illustrator']]['name'][_g.lang] + '</span>'
				)
				.appendTo(dom)

		// 改造信息
			if( d['series'] ){
				_db.ship_series.find({'id': d['series']}, function(err,docs){
					if( !err && docs && docs.length ){
						var prev_id = prev_lvl = prev_blueprint = next_id = next_lvl = next_blueprint = null
						// 遍历 docs[0].ships，寻找该舰娘ID，确定改造前后版本
							for(var i in docs[0].ships){
								if( docs[0].ships[i]['id'] == d['id'] ){
									var _i = parseInt(i)
									// 如果 i > 0，表明有改造前版本
										if( _i ){
											prev_id 		= docs[0].ships[ _i - 1 ]['id']
											prev_lvl 		= docs[0].ships[ _i - 1 ]['next_lvl']
											prev_blueprint 	= docs[0].ships[ _i - 1 ]['next_blueprint'] ? true : false
										}
									// 如果 i < docs[0].ships.length-1，表明有改造后版本
										if( _i < docs[0].ships.length-1 ){
											next_id 		= docs[0].ships[ _i + 1 ]['id']
											next_lvl 		= docs[0].ships[ _i ]['next_lvl']
											next_blueprint 	= docs[0].ships[ _i ]['next_blueprint'] ? true : false
										}
								}
							}
						// 根据刚才获得的数据创建改造信息DOM
							if( prev_id !== null || next_id !== null ){
								var remodels = $('<div class="remodels"/>').appendTo(dom)
								function shipDOM( ship_id, lvl, blueprint ){
									var ship_data = _g.data.ships[ship_id]
										,ship_name = ship_data['name']['zh_cn']
														+ (ship_data['name']['suffix']
															? '・' + _g.data.ship_namesuffix[ship_data['name']['suffix']]['zh_cn']
															: '')
										,tip = '<h3 class="shipinfo">'
													+ '<strong data-content="' + ship_name + '">'
														+ ship_name
													+ '</strong>'
													+ (
														ship_data['type'] ?
															'<small>' + _g['data']['ship_types'][ship_data['type']]['full_zh'] + '</span>'
															: ''
													)
												+ '</h3>'
									$('<div/>')
										.addClass('prev' + (blueprint ? ' blueprint' : '') )
										.html('<span>' + lvl + '</span>')
										.append(
											$('<button data-shipid="'+ ship_id +'" modal="true"/>')
												.attr('data-tip', tip)
												.html('<img src="' + _g.path.pics.ships + '/' + ship_id+'/0.jpg"/>')
										)
										.appendTo(remodels)
								}

								if( prev_id !== null )
									shipDOM(prev_id, prev_lvl, prev_blueprint)
								if( next_id !== null )
									shipDOM(next_id, next_lvl, next_blueprint)
							}
					}
				})
			}

		// 按钮
			var buttons = $('<div class="buttons"/>').appendTo(dom)

		_frame.modal.show(
			dom,
			_g.getName( d['name'], '・' ) || '舰娘',
			{
				'classname': 		'infos',
				'blank_to_close': 	true
			}
		)
	}
*/

_frame.app_main.page['ships'] = {}








_frame.app_main.page['ships'].init = function( page ){
}

/* 
 */

_frame.infos = {
	// curContent: 			null,			// 当前内容的hashCode

	show: function(cont, el, history){
		// 第一次运行，创建相关DOM和变量
			if( !_frame.infos.dom ){
				_frame.infos.dom = {
					'nav': 		$('<div class="infos"/>').appendTo( _frame.dom.nav ),
					'main': 	$('<div class="page infos"/>').appendTo( _frame.dom.main )
				}
				_frame.infos.dom.back = $('<button class="back" icon="arrow-left"/>')
						.html('返回')
						.on('click', function(){
							_frame.infos.hide()
						}).appendTo( _frame.infos.dom.nav )
			}

		// 先将内容区域设定为可见
			_frame.dom.layout.addClass('infos-show')

		// 处理内容
			switch(cont){
				case '__ship__':
					cont = _frame.infos.__ship(el)
					_frame.infos.dom.main.attr('data-infostype', 'shipinfo')
					break;
				case '__equipment__':
					cont = _frame.infos.__equipment(el)
					_frame.infos.dom.main.attr('data-infostype', 'equipmentinfo')
					break;
			}
			var hashcode = (cont.append) ? cont[0].outerHTML.hashCode() : cont.hashCode()
			if( _frame.infos.curContent != hashcode ){
				_frame.infos.dom.main.empty()
				if( cont.append )
					cont.appendTo( _frame.infos.dom.main )
				else
					_frame.infos.dom.main.html(cont)
				_p.initDOM( _frame.infos.dom.main )
				_frame.infos.curContent = hashcode
			}

		setTimeout(function(){
			// 显示内容
				_frame.dom.layout.addClass('infos-on')
		}, 1)
	},

	hide: function(){
		// 隐藏内容
			_frame.dom.layout.removeClass('infos-on')

		// 为主导航最后一个元素绑定 transitionEnd 事件
		// transitionEnd 触发后，检查 top CSS，如果为 0，判断动画播放结束
		// 将内容区域设定为不可见
			_frame.dom.navlinks.children('button:last-of-type')
					.on('transitionend.infos_hide', function(e){
						if( e.currentTarget == e.target && e.originalEvent.propertyName == 'top' && parseInt($(this).css('top')) == 0 ){
							_frame.dom.layout.removeClass('infos-show')
							_frame.infos.dom.main.attr('data-infostype', '')
							$(this).off('transitionend.infos_hide')
						}
					})
	}
}







// 初始化
_frame.infos.init = function(){
	if( _frame.infos.is_init )
		return true

	$body.on( 'click._infos', '[data-infos]', function(e){
			if( !(e.target.tagName.toLowerCase() == 'input' && e.target.className == 'compare') ){
				var el = $(this)
				_frame.infos.show(
					el.attr('data-infos'),
					el
				)
			}
		})

	_frame.infos.is_init = true
	return true
}














// 特殊内容

	// 舰娘信息
		_frame.infos.__ship = function( el ){
			var d = _g.data.ships[ el.data('shipid') ]

			if( debugmode )
				console.log(d)

			function _val( val, show_zero ){
				if( !show_zero && (val == 0 || val == '0') )
					return '<small class="zero">-</small>'
				if( val == -1 || val == '-1' )
					return '<small class="zero">?</small>'
				return val
			}
			function _add_stat( name, title, tar ){
				var val99 = 0
					,val150 = null

				function getStatOfLvl( lvl, base, max ){
					return Math.floor( base + (max - base) * lvl / 99 )
				}

				switch( name ){
					case 'hp':
						val99 = _val( d['stat']['hp'] )
						if (d['stat']['hp'] >= 90) val150 = d['stat']['hp'] + 9
						else if (d['stat']['hp'] >= 70) val150 = d['stat']['hp'] + 8
						else if (d['stat']['hp'] >= 50) val150 = d['stat']['hp'] + 7
						else if (d['stat']['hp'] >= 40) val150 = d['stat']['hp'] + 6
						else if (d['stat']['hp'] >= 30) val150 = d['stat']['hp'] + 5
						else val150 = d['stat']['hp'] + 4
						if (val150 > d['stat']['hp_max']) val150 = d['stat']['hp_max']
						break;
					case 'asw':
						val99 = _val( getStatOfLvl( 99, d['stat']['asw'], d['stat']['asw_max'] ), /^(5|8|9|12)$/.test(d['type']) )
						val150 = _val( getStatOfLvl( 150, d['stat']['asw'], d['stat']['asw_max'] ), /^(5|8|9|12)$/.test(d['type']) )
						break;
					case 'evasion':
					case 'los':
						val99 = _val( getStatOfLvl( 99, d['stat'][name], d['stat'][name + '_max'] ) )
						val150 = _val( getStatOfLvl( 150, d['stat'][name], d['stat'][name + '_max'] ) )
						break;
					case 'speed':
						val99 = _g.getStatSpeed( d['stat']['speed'] )
						break;
					case 'range':
						val99 = _g.getStatRange( d['stat']['range'] )
						break;
					case 'luck':
						val99 = d['stat']['luck'] + '<sup>' + d['stat']['luck_max'] + '</sup>'
						val150 = (d['stat']['luck'] + 3) + '<sup>' + d['stat']['luck_max'] + '</sup>'
						break;
					case 'fuel':
					case 'ammo':
						val99 = _val( d['consum'][name] )
						val150 = _val( Math.floor( d['consum'][name] * 0.85 ) )
						break;
					default:
						val99 = _val( d['stat'][name + '_max'] || d['stat'][name] )
						break;
				}

				$('<span/>')
					.html(
						'<small class="stat-'+name+'">' + title + '</small>'
						+ '<em'+( val150 ? ' class="lvl99"' : '' )+'>' + val99 + '</em>'
						+ ( val150 ? '<em class="lvl150">' + val150 + '</em>' : '' )
						//+ '<em class="lvl99'+( !val150 ? ' lvl150' : '' )+'">' + val99 + '</em>'
						//+ ( val150 ? '<em class="lvl150">' + val150 + '</em>' : '' )
					)
					.appendTo(tar)
			}

			//_frame.modal.resetContent()

			var dom = $('<div class="ship"/>')
				,ship_name = _g.getName( d['name'], '・' ) || '舰娘'
				,illustrations = []

			// 名称 & 舰种 & 舰级
				$('<div class="title"/>')
					.html(
						'<h2 data-content="' + ship_name + '">' + ship_name + '</h2>'
						+ '<small>'
							+ ( d['class'] ? _g['data']['ship_classes'][d['class']]['name_zh'] + '级' : '' )
							+ ( d['class_no'] ? '<em>' + d['class_no'] + '</em>号舰' : '' )
							+ ( d['type'] ? ' / ' + _g['data']['ship_types'][d['type']]['full_zh'] : '' )
						+ '</small>'
					).appendTo(dom)

			// 属性
				var lvlRadio99_id = '_input_g' + parseInt(_g.inputIndex)
					,lvlRadio150_id = '_input_g' + (parseInt(_g.inputIndex) + 1)
					,curLvl = parseInt(_config.get('ship_infos_lvl') || 99)
					,stats = $('<div class="stats"/>')
								.html(
									'<div class="title">'
										+ '<h4 data-content="基础属性">基础属性</h4>'
										+ '<span>'
											+ '<label for="'+lvlRadio99_id+'" class="lvl99">99</label>'
											+ '<label for="'+lvlRadio150_id+'" class="lvl150">150</label>'
										+ '</span>'
									+ '</div>'
								)
								.prepend(
									$('<input type="radio" name="ship_infos_lvl" id="'+lvlRadio99_id+'" value="99"/>')
										.prop('checked', curLvl == 99)
										.on('change', function(){
											_config.set('ship_infos_lvl', $(this).val())
										})
								)
								.prepend(
									$('<input type="radio" name="ship_infos_lvl" id="'+lvlRadio150_id+'" value="150"/>')
										.prop('checked', curLvl == 150)
										.on('change', function(){
											_config.set('ship_infos_lvl', $(this).val())
										})
								)
								.appendTo(dom)
					,stat1 = $('<div class="stat"/>').appendTo(stats)
					,stat2 = $('<div class="stat"/>').appendTo(stats)
					,stat3 = $('<div class="stat"/>').appendTo(stats)
					,stat_consum = $('<div class="stat consum"/>').appendTo(stats)

				_g.inputIndex+=2

				_add_stat( 'hp', 		'耐久',	stat1 )
				_add_stat( 'armor', 	'装甲',	stat1 )
				_add_stat( 'evasion', 	'回避',	stat1 )
				_add_stat( 'carry', 	'搭载',	stat1 )

				_add_stat( 'fire', 		'火力',	stat2 )
				_add_stat( 'torpedo', 	'雷装',	stat2 )
				_add_stat( 'aa', 		'对空',	stat2 )
				_add_stat( 'asw', 		'对潜',	stat2 )

				_add_stat( 'speed', 	'航速',	stat3 )
				_add_stat( 'range', 	'射程',	stat3 )
				_add_stat( 'los', 		'索敌',	stat3 )
				_add_stat( 'luck', 		'运',	stat3 )

				_add_stat( 'fuel', 		'油耗',	stat_consum )
				_add_stat( 'ammo', 		'弹耗',	stat_consum )

			// 初始装备 & 搭载量
				var equips = $('<div class="equipments"/>').html('<h4 data-content="初始装备 & 搭载量">初始装备 & 搭载量</h4>').appendTo(dom)
					,i = 0
				while( i < 4 ){
					var equip = $('<button/>').appendTo(equips)
						,icon = $('<i/>').appendTo( equip )
						,name = $('<small/>').appendTo( equip )
						,slot = $('<em/>').appendTo( equip )

					if( typeof d['slot'][i] == 'undefined' ){
						equip.addClass('no')
					}else if( typeof d['equip'][i] == 'undefined' || !d['equip'][i] || d['equip'][i] === '' ){
						equip.addClass('empty')
						name.html( '--未装备--' )
						slot.html( d['slot'][i] )
					}else{
						var item_data = _g.data.items[d['equip'][i]]
							,item_icon = 'assets/images/itemicon/'
											+ _g.data.item_types[item_data['type']]['icon']
											+ '.png'
						function _stat(stat, title){
							if( item_data['stat'][stat] ){
								switch(stat){
									case 'range':
										return '<span>射程: ' + _g.getStatRange( item_data['stat'][stat] ) + '</span>';
										break;
									default:
										var val = parseInt( item_data['stat'][stat] )
										return '<span>' + ( val > 0 ? '+' : '') + val + ' ' + title + '</span>'
										break;
								}
							}else{
								return ''
							}
						}
						equip.attr({
							//'data-equipmentid': 	d['equip'][i],
							'data-tip-position': 	'left',
							//'data-infos': 			"__equipment__",
							'data-tip':		'<h3 class="itemstat">'
												+ '<s style="background-image: url(' + item_icon + ')"></s>'
												+ '<strong data-content="' + item_data['name']['zh_cn'] + '">'
													+ item_data['name']['zh_cn']
												+ '</strong>'
												+ '<small>' + _g.data.item_types[item_data['type']]['name']['zh_cn'] + '</small>'
											+ '</h3>'
											+ _stat('fire', '火力')
											+ _stat('torpedo', '雷装')
											+ _stat('aa', '对空')
											+ _stat('asw', '对潜')
											+ _stat('bomb', '爆装')
											+ _stat('hit', '命中')
											+ _stat('armor', '装甲')
											+ _stat('evasion', '回避')
											+ _stat('los', '索敌')
											+ _stat('range', '射程')
						})
						name.html(
							item_data['name']['zh_cn'].replace(/（([^（^）]+)）/g, '<small>($1)</small>')
						)
						slot.html( d['slot'][i] )
						icon.css(
							'background-image',
							'url(' + item_icon + ')'
						)
					}
					i++
				}

			// 声优 & 画师 & 消耗
				$('<span class="entity"/>')
					.html(
						'<strong>声优</strong>'
						+ '<span>' + _g['data']['entities'][d['rels']['cv']]['name'][_g.lang] + '</span>'
					)
					.appendTo(dom)
				$('<span class="entity"/>')
					.html(
						'<strong>画师</strong>'
						+ '<span>' + _g['data']['entities'][d['rels']['illustrator']]['name'][_g.lang] + '</span>'
					)
					.appendTo(dom)
					/*
				var consum = $('<span class="consum"/>').html('<strong>消耗</strong>').appendTo(dom)
				_add_stat( 'fuel', 		'', _val( d['consum']['fuel'] ),		consum )
				_add_stat( 'ammo', 		'', _val( d['consum']['ammo'] ),		consum )
				*/

			// 改造信息
				var remodels = $('<div class="remodels"/>').html('<h4 data-content="改造">改造</h4>').appendTo(dom)
					,remodels_container = _p.el.flexgrid.create().appendTo( remodels )
				if( d['series'] ){
					_db.ship_series.find({'id': d['series']}, function(err,docs){
						if( !err && docs && docs.length ){
							// 遍历 docs[0].ships
								for(var i in docs[0].ships){
									var _i = parseInt(i)
										,remodel_ship_data = _g.data.ships[docs[0].ships[i]['id']]
										,remodel_ship_name = remodel_ship_data['name']['zh_cn']
														+ (remodel_ship_data['name']['suffix']
															? '・' + _g.data.ship_namesuffix[remodel_ship_data['name']['suffix']]['zh_cn']
															: '')
										,tip = '<h3 class="shipinfo">'
													+ '<strong data-content="' + remodel_ship_name + '">'
														+ remodel_ship_name
													+ '</strong>'
													+ (
														remodel_ship_data['type'] ?
															'<small>' + _g['data']['ship_types'][remodel_ship_data['type']]['full_zh'] + '</span>'
															: ''
													)
												+ '</h3>'
										,remodel_lvl = _i ? docs[0].ships[ _i - 1 ]['next_lvl'] : null
										,remodel_blueprint = _i ? (docs[0].ships[ _i - 1 ]['next_blueprint']) : null

									remodels_container.appendDOM(
										$('<button class="unit" data-shipid="'+ docs[0].ships[i]['id'] +'" data-infos="__ship__"/>')
											.attr('data-tip', tip)
											.addClass(docs[0].ships[i]['id'] == d['id'] ? 'on' : '')
											.addClass(remodel_blueprint ? 'blueprint' : '')
											.html(
												'<i><img src="' + _g.path.pics.ships + '/' + docs[0].ships[i]['id']+'/0.webp"/></i>'
												+ (remodel_lvl ? '<strong>' + remodel_lvl + '</strong>' : '')
											)
									)

									// 处理图鉴信息
										if( docs[0].ships[i]['id'] == d['id'] ){
											if( docs[0].ships[i].illust_delete ){
												if( _i ){
													illustrations.push( docs[0].ships[_i - 1]['id'] )
													if( docs[0].ships[_i - 1].illust_extra && docs[0].ships[_i - 1].illust_extra.length && docs[0].ships[_i - 1].illust_extra[0] ){
														//illustrations = illustrations.concat('extra_'+docs[0].ships[_i - 1].illust_extra)
														for( var j in docs[0].ships[_i - 1].illust_extra ){
															illustrations.push( 'extra_' + docs[0].ships[_i - 1].illust_extra[j] )
														}
													}
												}
											}else{
												illustrations.push( docs[0].ships[i]['id'] )
												if( docs[0].ships[i].illust_extra && docs[0].ships[i].illust_extra.length && docs[0].ships[i].illust_extra[0] ){
													for( var j in docs[0].ships[i].illust_extra ){
														illustrations.push( 'extra_' + docs[0].ships[i].illust_extra[j] )
													}
													//illustrations = illustrations.concat('extra_'+docs[0].ships[i].illust_extra)
												}
											}
										}
								}
								var index = 0
								function check_append( file ){
									file = file.replace(/\\/g, '/')
									try{
										var stat = node.fs.lstatSync(file)
										if( stat && stat.isFile() ){
											index++
											$('<input type="radio" name="ship_'+d['id']+'_illustrations" value="'+index+'"/>')
												.prop('checked', (index == 1))
												.insertBefore(illusts_container)
											$('<span class="container"/>')
												.html('<img src="'+file+'"/>')
												//.css('background-image', 'url(' + file + ')')
												.appendTo(illusts_container)
										}
									}catch(e){}
								}
								for( var i in illustrations ){
									//if( i )
									//	check_append( _g.path.pics.ships + '/' + illustrations[i] + '/2.jpg' )
									check_append( _g.path.pics.ships + '/' + illustrations[i] + '/8.webp' )
									check_append( _g.path.pics.ships + '/' + illustrations[i] + '/9.webp' )
								}
						}
					})
				}

			// 图鉴
				// illustrations
				var illusts = $('<aside class="illustrations"/>').appendTo(dom)
					,illusts_container = $('<div/>').appendTo(illusts)

			return dom
			/*
			// 按钮
				var buttons = $('<div class="buttons"/>').appendTo(dom)

			_frame.modal.show(
				dom,
				_g.getName( d['name'], '・' ) || '舰娘',
				{
					'classname': 		'infos',
					'blank_to_close': 	true
				}
			)
			*/
		}

	// 装备信息
		_frame.infos.__equipment = function( el ){
			var d = _g.data.items[ el.data('equipmentid') ]

			if( debugmode )
				console.log(d)

			function _stat(stat, title){
				if( d['stat'][stat] ){
					var value = ''
					switch(stat){
						case 'range':
							value = '<span>射程: ' + _g.getStatRange( d['stat'][stat] ) + '</span>';
							break;
						default:
							var val = parseInt( d['stat'][stat] )
							value = '<span>' + ( val > 0 ? '+' : '') + val + ' ' + title + '</span>'
							break;
					}
					$('<span/>').html(value).appendTo(stat_container)
				}//else{
				//	return ''
				//}
			}

			var dom = $('<div class="equipment"/>')

			// 名称 & 类型
				$('<div class="title"/>')
					.html(
						'<h2 data-content="' + d['name']['zh_cn'] + '">' + d['name']['zh_cn'] + '</h2>'
						+ '<small>'
							+ ( d['type'] ? _g['data']['item_types'][d['type']]['name']['zh_cn'] : '' )
						+ '</small>'
					).appendTo(dom)

			// 属性
				var stats = $('<div class="stats"/>')
								.html('<h4 data-content="属性">属性</h4>')
								.appendTo(dom)
					,stat_container = $('<div class="stat"/>').appendTo(stats)

				_stat('fire', '火力')
				_stat('torpedo', '雷装')
				_stat('aa', '对空')
				_stat('asw', '对潜')
				_stat('bomb', '爆装')
				_stat('hit', '命中')
				_stat('armor', '装甲')
				_stat('evasion', '回避')
				_stat('los', '索敌')
				_stat('range', '射程')

			// 初始装备于
				var equipped = $('<div class="equipped"/>').html('<h4 data-content="初始装备于">初始装备于</h4>').appendTo(dom)
					,equipped_container = _p.el.flexgrid.create().appendTo( equipped )
				if( d.default_equipped_on && d.default_equipped_on.length ){
					for( var i in d.default_equipped_on ){
						var ship_data = _g.data.ships[d.default_equipped_on[i]]
						equipped_container.appendDOM(
							$('<button class="unit" data-infos="__ship__"/>')
								.attr({
									'data-shipid': 	d.default_equipped_on[i],
									'data-infos': 	'__ship__',
									'data-infos-history': 	true
								})
								.html(
									'<img src="' + _g.path.pics.ships + '/' + d.default_equipped_on[i]+'/0.webp"/>'
									+ '<span>'
										+ (d['type'] ? '<small>' + _g['data']['ship_types'][ship_data['type']]['full_zh'] + '</small>' : '' )
										+ _g.getName( ship_data['name'], '・' )
									+ '</span>'
								)
						)
					}
				}else{
					equipped_container.addClass('no').html('暂无初始配置该装备的舰娘...')
				}

			// 图鉴
				var illusts = $('<aside class="illustrations"/>').appendTo(dom)
				try{
					var file = _g.path.pics.items + '/' + d['id'] + '/card.webp'
						,stat = node.fs.lstatSync(file)
					if( stat && stat.isFile() ){
						$('<img src="'+file+'"/>')
							.appendTo(illusts)
					}
				}catch(e){}

			return dom
		}

/*
 */
_p.el.tablelist = {
	init_el: function(el){
		if( el.data('tablelist') )
			return true

		el.data({
			'tablelist': new _tablelist( el )
		})
	},

	init: function(tar, els){
		tar = tar || $body;
		els = els || tar.find('.tablelist')

		els.each(function(){
			_p.el.tablelist.init_el($(this))
		})
	}
}






var _tablelist = function( container, options ){
	this.dom = {
		'container': 	container
	}

	if( container.hasClass('ships') )
		this.listtype = 'ships'
	else if( container.hasClass('equipments') )
		this.listtype = 'equipments'

	this._index = this.global_index
	this.global_index++

	this.init();
}

_tablelist.prototype.global_index = 0












// Ships
	_tablelist.prototype._ships_columns = [
		'  ',
		['火力',	'fire'],
		['雷装',	'torpedo'],
		['对空',	'aa'],
		['对潜',	'asw'],
		['耐久',	'hp'],
		['装甲',	'armor'],
		['回避',	'evasion'],
		['搭载',	'carry'],
		['航速',	'speed'],
		['射程',	'range'],
		['索敌',	'los'],
		['运',		'luck'],
		['油耗',	'consum_fuel'],
		['弹耗',	'consum_ammo']
	]
	_tablelist.prototype._ships_header_checkbox = []
	_tablelist.prototype._ships_append_item = function( ship_data, header_index ){
		var self = this
			//,tr = $('<tr class="row" data-shipid="'+ ship_data['id'] +'" data-header="'+ header_index +'" modal="true"/>')
			,tr = $('<tr class="row" data-shipid="'+ ship_data['id'] +'" data-header="'+ header_index +'" data-infos="__ship__"/>')
					.attr({
						'data-shipedit':self.dom.container.hasClass('shiplist-edit') ? 'true' : null
					})
					.appendTo( this.dom.tbody )
			,max_carry = 0
			,name = ship_data['name']['zh_cn']
					+ (ship_data['name']['suffix']
						? '<small>' + _g.data.ship_namesuffix[ship_data['name']['suffix']]['zh_cn'] + '</small>'
						: '')
			,checkbox = $('<input type="checkbox" class="compare"/>').on('click, change',function(e, not_trigger_check){
								if( $(this).prop('checked') )
									tr.attr('compare-checked', true )
								else
									tr.removeAttr('compare-checked')
								self._ships_compare_btn_show( $(this).prop('checked') )
								if( !not_trigger_check )
									self._ships_header_checkbox[header_index].trigger('docheck')
							})

		self._ships_header_checkbox[header_index].data(
				'ships', 
				self._ships_header_checkbox[header_index].data('ships').add( tr )
			)
		tr.data('checkbox', checkbox)

		for( var i in ship_data['carry'] ){
			max_carry+= ship_data['carry'][i]
		}

		function _val( val, show_zero ){
			if( !show_zero && (val == 0 || val == '0') )
				return '<small class="zero">-</small>'
			if( val == -1 || val == '-1' )
				return '<small class="zero">?</small>'
			return val
		}

		for( var i in self._ships_columns ){
			switch( self._ships_columns[i][1] ){
				case ' ':
					$('<th/>')
						.html(
							//'<img src="../pics/ships/'+ship_data['id']+'/0.jpg"/>'
							'<img src="' + _g.path.pics.ships + '/' + ship_data['id']+'/0.webp" contextmenu="disabled"/>'
							+ '<strong>' + name + '</strong>'
							//+ '<small>' + ship_data['pron'] + '</small>'
						)
						.prepend(
							checkbox
						)
						.appendTo(tr)
					break;
				case 'fire':
					$('<td data-stat="fire" data-value="' + ship_data['stat']['fire_max'] + '"/>')
						.html( _val( ship_data['stat']['fire_max'] ) )
						.appendTo(tr)
					break;
				case 'torpedo':
					$('<td data-stat="torpedo" data-value="' + ship_data['stat']['torpedo_max'] + '"/>')
						.html( _val( ship_data['stat']['torpedo_max'] ) )
						.appendTo(tr)
					break;
				case 'aa':
					$('<td data-stat="aa" data-value="' + ship_data['stat']['aa_max'] + '"/>')
						.html( _val( ship_data['stat']['aa_max'] ) )
						.appendTo(tr)
					break;
				case 'asw':
					$('<td data-stat="asw" data-value="' + ship_data['stat']['asw_max'] + '"/>')
						.html( _val(
							ship_data['stat']['asw_max'],
							/^(5|8|9|12)$/.test( ship_data['type'] )
						) )
						.appendTo(tr)
					break;
				case 'hp':
					$('<td data-stat="hp" data-value="' + ship_data['stat']['hp'] + '"/>')
						.html(_val( ship_data['stat']['hp'] ))
						.appendTo(tr)
					break;
				case 'armor':
					$('<td data-stat="armor" data-value="' + ship_data['stat']['armor_max'] + '"/>')
						.html(_val( ship_data['stat']['armor_max'] ))
						.appendTo(tr)
					break;
				case 'evasion':
					$('<td data-stat="evasion" data-value="' + ship_data['stat']['evasion_max'] + '"/>')
						.html(_val( ship_data['stat']['evasion_max'] ))
						.appendTo(tr)
					break;
				case 'carry':
					$('<td data-stat="carry" data-value="' + ship_data['stat']['carry'] + '"/>')
						.html(_val( ship_data['stat']['carry'] ))
						.appendTo(tr)
					break;
				case 'speed':
					$('<td data-stat="speed" data-value="' + ship_data['stat']['speed'] + '"/>')
						.html( _g.getStatSpeed( ship_data['stat']['speed'] ) )
						.appendTo(tr)
					break;
				case 'range':
					$('<td data-stat="range" data-value="' + ship_data['stat']['range'] + '"/>')
						.html( _g.getStatRange( ship_data['stat']['range'] ) )
						.appendTo(tr)
					break;
				case 'los':
					$('<td data-stat="los" data-value="' + ship_data['stat']['los_max'] + '"/>')
						.html(_val( ship_data['stat']['los_max'] ))
						.appendTo(tr)
					break;
				case 'luck':
					$('<td data-stat="luck" data-value="' + ship_data['stat']['luck'] + '"/>')
						.html(ship_data['stat']['luck'] + '<sup>' + ship_data['stat']['luck_max'] + '</sup>')
						.appendTo(tr)
					break;
				case 'consum_fuel':
					$('<td data-stat="consum_fuel" data-value="' + ship_data['consum']['fuel'] + '"/>')
						.html(ship_data['consum']['fuel'])
						.appendTo(tr)
					break;
				case 'consum_ammo':
					$('<td data-stat="consum_ammo" data-value="' + ship_data['consum']['ammo'] + '"/>')
						.html(ship_data['consum']['ammo'])
						.appendTo(tr)
					break;
			}
		}

		// 检查数据是否存在 remodel_next
		// 如果 remodel_next 与当前数据 type & name 相同，标记当前为可改造前版本
		if( ship_data.remodel_next
			&& _g.data.ships[ ship_data.remodel_next ]
			&& _g.ship_type_order_map[ship_data['type']] == _g.ship_type_order_map[_g.data.ships[ ship_data.remodel_next ]['type']]
			&& ship_data['name']['ja_jp'] == _g.data.ships[ ship_data.remodel_next ]['name']['ja_jp']
		){
			tr.addClass('premodeled')
		}

		return tr
	}
	_tablelist.prototype._ships_append_all_items = function(){
		var self = this
		/*
		for( var i in _g.data.ship_id_by_type ){
			if( typeof _g.ship_type_order[i] == 'object' ){
				var data_shiptype = _g.data.ship_types[ _g.ship_type_order[i][0] ]
			}else{
				var data_shiptype = _g.data.ship_types[ _g.ship_type_order[i] ]
			}
			$('<tr class="typetitle"><th colspan="' + (self._ships_columns.length + 1) + '">'
				+ data_shiptype['full_zh'] + '<small>[' + data_shiptype['code'] + ']</small>'
				+ '</th></tr>')
				.appendTo( this.dom.tbody )

			for( var j in _g.data.ship_id_by_type[i] ){
				self._ships_append_item( _g.data.ships[ _g.data.ship_id_by_type[i][j] ] )
			}

			var k = 0
			while(k < 9){
				$('<tr class="empty"/>').appendTo(this.dom.tbody)
				k++
			}
		}
		*/
		function _do( i, j ){
			if( _g.data.ship_id_by_type[i] ){
				if( !j ){
					if( typeof _g.ship_type_order[i] == 'object' ){
						var data_shiptype = _g.data.ship_types[ _g.ship_type_order[i][0] ]
					}else{
						var data_shiptype = _g.data.ship_types[ _g.ship_type_order[i] ]
					}

					var checkbox_id = '_input_g' + parseInt(_g.inputIndex)
						,tr = $('<tr class="typetitle"><th colspan="' + (self._ships_columns.length + 1) + '">'
								+ '<label for="' + checkbox_id + '">'
								+ data_shiptype['full_zh'] + '<small>[' + data_shiptype['code'] + ']</small>'
								+ '</label></th></tr>')
								.appendTo( self.dom.tbody )

					self._ships_header_checkbox[i]
						= $('<input type="checkbox" id="' + checkbox_id + '"/>')
							.on({
								'change': function(){
									var _checkbox = $(this)
									_checkbox.data('ships').filter(':visible').each(function(){
										$(this).data('checkbox').prop('checked', _checkbox.prop('checked')).trigger('change', [true])
									})
								},
								'docheck': function(){
									// ATTR: compare-checked
									var trs = $(this).data('ships').filter(':visible')
										,checked = trs.filter('[compare-checked=true]')
									if( !checked.length ){
										$(this).prop({
											'checked': 			false,
											'indeterminate': 	false
										})
									}else if( checked.length < trs.length ){
										$(this).prop({
											'checked': 			false,
											'indeterminate': 	true
										})
									}else{
										$(this).prop({
											'checked': 			true,
											'indeterminate': 	false
										})
									}
								}
							})
							.data('ships', $())
							.prependTo( tr.find('th') )

					_g.inputIndex++
				}

				self._ships_append_item( _g.data.ships[ _g.data.ship_id_by_type[i][j] ], i )

				setTimeout(function(){
					if( j >= _g.data.ship_id_by_type[i].length - 1 ){
						var k = 0
						while(k < 9){
							$('<tr class="empty"/>').appendTo(self.dom.tbody)
							k++
						}
						_do( i+1, 0 )
					}else{
						_do( i, j+1 )
					}
				}, 0)
			}else{
				self.mark_high()
				_frame.app_main.loaded('tablelist_'+self._index, true)
			}
		}
		_do( 0, 0 )
	}
	_tablelist.prototype._ships_compare_btn_show = function( is_checked ){
		if( (!is_checked && this.dom.tbody.find('input[type="checkbox"].compare:checked').length)
			|| is_checked
		){
			this.dom.msg_container.attr('data-msgs', 'comparestart')
		}else{
			this.dom.msg_container.removeAttr('data-msgs')
		}
	}
	_tablelist.prototype._ships_compare_start = function(){
		this.dom.msg_container.removeAttr('data-msgs')
		this._ships_last_viewtype = this.dom.filter_container.attr('viewtype')
		this.dom.filter_container.attr('viewtype', 'compare')
		_config.set( 'shiplist-viewtype', this._ships_last_viewtype )
		this.mark_high()
	}
	_tablelist.prototype._ships_compare_end = function(){
		this.dom.tbody.find('input[type="checkbox"].compare:checked').prop('checked', false).trigger('change')
		this.dom.filter_container.attr('viewtype', this._ships_last_viewtype)
		delete this._ships_last_viewtype
		this.dom.msg_container.removeAttr('data-msgs')
		this.mark_high()
	}
	_tablelist.prototype._ships_compare_continue = function(){
		this.dom.filter_container.attr('viewtype', this._ships_last_viewtype)
		delete this._ships_last_viewtype
		this.dom.msg_container.attr('data-msgs', 'comparestart')
		this.mark_high()
	}
	_tablelist.prototype._ships_init = function(){
		var self = this

		// 标记全局载入状态
			_frame.app_main.loading.push('tablelist_'+this._index)
			_frame.app_main.is_loaded = false

		// 生成过滤器与选项
			this.dom.filter_container = $('<div class="options"/>').appendTo( this.dom.container )
			this.dom.filters = $('<div class="filters"/>').appendTo( this.dom.filter_container )
			this.dom.exit_compare = $('<div class="exit_compare"/>')
									.append(
										$('<button icon="close"/>')
											.html('结束对比')
											.on('click', function(){
												self._ships_compare_end()
											})
									)
									.append(
										$('<button icon="checkbox-checked"/>')
											.html('继续选择')
											.on('click', function(){
												self._ships_compare_continue()
											})
									)
									.appendTo( this.dom.filter_container )

		// 初始化设置
			this.append_option( 'checkbox', 'hide-premodel', '仅显示同种同名舰最终版本',
				_config.get( 'shiplist-filter-hide-premodel' ) === 'false' ? null : true, null, {
					'onchange': function( e, input ){
						_config.set( 'shiplist-filter-hide-premodel', input.prop('checked') )
						self.dom.filter_container.attr('filter-hide-premodel', input.prop('checked'))
					}
				} )
			this.append_option( 'radio', 'viewtype', null, [
					['card', ''],
					['list', '']
				], null, {
					'radio_default': _config.get( 'shiplist-viewtype' ),
					'onchange': function( e, input ){
						if( input.is(':checked') ){
							_config.set( 'shiplist-viewtype', input.val() )
							self.dom.filter_container.attr('viewtype', input.val())
						}
					}
				} )
			this.dom.filters.find('input').trigger('change')

		// 生成表格框架
			this.dom.table_container = $('<div class="fixed-table-container"/>').appendTo( this.dom.container )
			this.dom.table_container_inner = $('<div class="fixed-table-container-inner"/>').appendTo( this.dom.table_container )
			this.dom.table = $('<table class="ships hashover hashover-column"/>').appendTo( this.dom.table_container_inner )
			function gen_thead(arr){
				var thead = $('<thead/>')
					,tr = $('<tr/>').appendTo(thead)
				for(var i in arr){
					if( typeof arr[i] == 'object' ){
						$('<td data-stat="' + arr[i][1] + '"/>').html('<div class="th-inner">'+arr[i][0]+'</div>').appendTo(tr)
					}else{
						$('<th/>').html('<div class="th-inner">'+arr[i]+'</div>').appendTo(tr)
					}
				}
				return thead
			}
			gen_thead( self._ships_columns ).appendTo( this.dom.table )
			this.dom.tbody = $('<tbody/>').appendTo( this.dom.table )

		// 获取所有舰娘数据，按舰种顺序 (_g.ship_type_order / _g.ship_type_order_map) 排序
		// -> 获取舰种名称
		// -> 生成舰娘DOM
			if( _g.data.ship_types ){
				self._ships_append_all_items()
			}else{
				$('<p/>').html('暂无数据...').appendTo( self.dom.table_container_inner )
			}
			//_db.ships.find({}).sort({'type': 1, 'class': 1, 'class_no': 1, 'time_created': 1, 'name.suffix': 1}).exec(function(err, docs){
			//	if( !err ){
			//		for(var i in docs){
			//			_g.data.ships[docs[i]['id']] = docs[i]

			//			if( typeof _g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] == 'undefined' )
			//				_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ] = []
			//			_g.data.ship_id_by_type[ _g.ship_type_order_map[docs[i]['type']] ].push( docs[i]['id'] )
			//		}
			//	}

				/*
				_db.ship_types.find({}, function(err2, docs2){
					if( !err2 ){
						for(var i in docs2 ){
							_g.data.ship_types[docs2[i]['id']] = docs2[i]
						}

					}
				})
				*/
			//	if( _g.data.ship_types ){
			//		self._ships_append_all_items()
			//	}else{
			//		$('<p/>').html('暂无数据...').appendTo( self.dom.table_container_inner )
			//	}
			//})

		// 生成底部内容框架
			this.dom.msg_container = $('<div class="msgs"/>').appendTo( this.dom.container )
			if( !_config.get( 'hide-compareinfos' ) )
				this.dom.msg_container.attr( 'data-msgs', 'compareinfos' )

		// 生成部分底部内容
			var compareinfos = $('<div class="compareinfos"/>').html('点击舰娘查询详细信息，勾选舰娘进行对比').appendTo( this.dom.msg_container )
				$('<button/>').html('&times;').on('click', function(){
					self.dom.msg_container.removeAttr('data-msgs')
					_config.set( 'hide-compareinfos', true )
				}).appendTo( compareinfos )
			var comparestart = $('<div class="comparestart"/>').html('开始对比')
								.on('click', function(){
									self._ships_compare_start()
								}).appendTo( this.dom.msg_container )
	}












// Equipments
	_tablelist.prototype._equipments_columns = [
		'  ',
		['火力',	'fire'],
		['雷装',	'torpedo'],
		['对空',	'aa'],
		['对潜',	'asw'],
		['爆装',	'bomb'],
		['命中',	'hit'],
		['装甲',	'armor'],
		['回避',	'evasion'],
		['索敌',	'los'],
		['射程',	'range']
	]
	_tablelist.prototype._equipments_append_item = function( equipment_data, collection_id ){
		var self = this
			,tr = $('<tr class="row" data-equipmentid="'+ equipment_data['id'] +'" data-equipmentcollection="'+ collection_id +'" data-infos="__equipment__"/>')
					.attr({
						'data-equipmentedit':self.dom.container.hasClass('equipmentlist-edit') ? 'true' : null
					})
					.appendTo( this.dom.tbody )

		function _val( val, show_zero ){
			if( !show_zero && (val == 0 || val == '0') )
				return '<small class="zero">-</small>'
			//if( val > 0 )
			//	return '+' + val
			return val
		}

		for( var i in self._equipments_columns ){
			switch( self._equipments_columns[i][1] ){
				case ' ':
					$('<th/>').html(equipment_data['name']['zh_cn']).appendTo(tr)
					break;
				case 'range':
					$('<td data-stat="range" data-value="' + equipment_data['stat']['range'] + '"/>')
						.html( _g.getStatRange( equipment_data['stat']['range'] ) )
						.appendTo(tr)
					break;
				default:
					$('<td data-stat="'+self._equipments_columns[i][1]+'" data-value="' + equipment_data['stat'][self._equipments_columns[i][1]] + '"/>')
						.html( _val( equipment_data['stat'][self._equipments_columns[i][1]] ) )
						.appendTo(tr)
					break;
			}
		}

		return tr
	}
	_tablelist.prototype._equipments_append_all_items = function(){
		var self = this
		function _do( i, j ){
			if( _g.data.item_id_by_type[i] ){
				if( !j ){
					var data_equipmenttype = _g.data.item_types[ _g.item_type_order[i] ]
					$('<tr class="typetitle" data-equipmentcollection="'+_g.data.item_id_by_type[i]['collection']+'">'
								+ '<th colspan="' + (self._equipments_columns.length + 1) + '">'
								+ '<span style="background-image: url(../app/assets/images/itemicon/'+data_equipmenttype['icon']+'.png)"></span>'
								+ data_equipmenttype['name']['zh_cn']
								+ '</th></tr>'
							).appendTo( self.dom.tbody )
				}

				self._equipments_append_item(
					_g.data.items[ _g.data.item_id_by_type[i]['equipments'][j] ],
					_g.data.item_id_by_type[i]['collection']
				)

				setTimeout(function(){
					if( j >= _g.data.item_id_by_type[i]['equipments'].length - 1 ){
						_do( i+1, 0 )
					}else{
						_do( i, j+1 )
					}
				}, 0)
			}else{
				//self.mark_high()
				_frame.app_main.loaded('tablelist_'+self._index, true)
			}
		}
		_do( 0, 0 )
	}
	_tablelist.prototype._equipments_init = function(){
		var self = this

		// 根据装备大类和类型排序整理装备ID
			if( !_g.data.item_id_by_type ){
				_g.data.item_id_by_type = []
				_g.item_type_order = []
				var type_by_collection = {}
					,type_order_map = {}
				// 遍历大类
					for(var i in _g.data.item_type_collections){
						for(var j in _g.data.item_type_collections[i]['types']){
							type_by_collection[ _g.data.item_type_collections[i]['types'][j] ] = i
							_g.item_type_order.push( _g.data.item_type_collections[i]['types'][j] )
							type_order_map[ _g.data.item_type_collections[i]['types'][j] ] = _g.item_type_order.length - 1
						}
					}
				// 遍历装备数据
					for(var i in _g.data.items){
						var order = type_order_map[ _g.data.items[i]['type'] ]
						if( !_g.data.item_id_by_type[order] )
							_g.data.item_id_by_type[order] = {
								'collection': type_by_collection[_g.data.items[i]['type']],
								'equipments': []
							}
						_g.data.item_id_by_type[order]['equipments'].push( _g.data.items[i]['id'] )
					}
			}

		// 标记全局载入状态
			_frame.app_main.loading.push('tablelist_'+this._index)
			_frame.app_main.is_loaded = false

		// 生成过滤器与选项
			this.dom.filter_container = $('<div class="options"/>').appendTo( this.dom.container )
			this.dom.filters = $('<div class="filters"/>').appendTo( this.dom.filter_container )

		// 装备大类切换
			var checked = false
			for(var i in _g.data.item_type_collections){
				var radio_id = '_input_g' + parseInt(_g.inputIndex)
				$('<input type="radio" name="equipmentcollection" id="'+radio_id+'" value="'+i+'"/>')
					.prop('checked', !checked )
					.prependTo( this.dom.container )
				$('<label class="tab container" for="'+radio_id+'" data-equipmentcollection="'+i+'"/>')
					.html(
						'<i></i><em></em>'
						+ '<span>' + _g.data.item_type_collections[i]['name']['zh_cn'].replace(/\&/g, '<br/>') + '</span>'
					)
					.appendTo( self.dom.filters )
				checked = true
				_g.inputIndex++
			}

		// 生成表格框架
			this.dom.table_container = $('<div class="fixed-table-container"/>').appendTo( this.dom.container )
			this.dom.table_container_inner = $('<div class="fixed-table-container-inner"/>').appendTo( this.dom.table_container )
			this.dom.table = $('<table class="equipments hashover hashover-column"/>').appendTo( this.dom.table_container_inner )
			function gen_thead(arr){
				var thead = $('<thead/>')
					,tr = $('<tr/>').appendTo(thead)
				for(var i in arr){
					if( typeof arr[i] == 'object' ){
						$('<td data-stat="' + arr[i][1] + '"/>').html('<div class="th-inner">'+arr[i][0]+'</div>').appendTo(tr)
					}else{
						$('<th/>').html('<div class="th-inner">'+arr[i]+'</div>').appendTo(tr)
					}
				}
				return thead
			}
			gen_thead( self._equipments_columns ).appendTo( this.dom.table )
			this.dom.tbody = $('<tbody/>').appendTo( this.dom.table )

		// 生成装备数据DOM
			self._equipments_append_all_items()

		// 生成底部内容框架
			this.dom.msg_container = $('<div class="msgs"/>').appendTo( this.dom.container )
			if( !_config.get( 'hide-equipmentsinfos' ) )
				this.dom.msg_container.attr( 'data-msgs', 'equipmentsinfos' )

		// 生成部分底部内容
			var equipmentsinfos = $('<div class="equipmentsinfos"/>').html('点击装备查询初装舰娘等信息').appendTo( this.dom.msg_container )
				$('<button/>').html('&times;').on('click', function(){
					self.dom.msg_container.removeAttr('data-msgs')
					_config.set( 'hide-equipmentsinfos', true )
				}).appendTo( equipmentsinfos )
	}










_tablelist.prototype.append_option = function( type, name, label, value, suffix, options ){
	options = options || {}
	function gen_input(){
		switch( type ){
			case 'text':
			case 'number':
			case 'hidden':
				var input = $('<input type="'+type+'" name="'+name+'" id="'+id+'" />').val(value)
				break;
			case 'select':
				var input = $('<select name="'+name+'" id="'+id+'" />')
				var option_empty = $('<option value=""/>').html('').appendTo( input )
				for( var i in value ){
					if( typeof value[i] == 'object' ){
						var o_el = $('<option value="' + (typeof value[i].val == 'undefined' ? value[i]['value'] : value[i].val) + '"/>')
							.html(value[i]['title'] || value[i]['name'])
							.appendTo( input )
					}else{
						var o_el = $('<option value="' + value[i] + '"/>')
							.html(value[i])
							.appendTo( input )
					}
					if( typeof options['default'] != 'undefined' && o_el.val() == options['default'] ){
						o_el.prop('selected', true)
					}
				}
				if( !value || !value.length ){
					option_empty.remove()
					$('<option value=""/>').html('...').appendTo( input )
				}
				if( options['new'] ){
					$('<option value=""/>').html('==========').insertAfter( option_empty )
					$('<option value="___new___"/>').html('+ 新建').insertAfter( option_empty )
					input.on('change.___new___', function(){
						var select = $(this)
						if( select.val() == '___new___' ){
							select.val('')
							options['new']( input )
						}
					})
				}
				break;
			case 'checkbox':
				var input = $('<input type="'+type+'" name="'+name+'" id="'+id+'" />').prop('checked', value)
				break;
			case 'radio':
				var input = $();
				for( var i in value ){
					var title, val
						,checked = false
					if( value[i].push ){
						val = value[i][0]
						title = value[i][1]
					}else{
						val = value[i].val || value[i].value
						title = value[i].title || value[i].name
					}
					if( options.radio_default && options.radio_default == val )
						checked = true
					input = input.add(
						$('<input type="radio" name="'+name+'" id="'+id+'-'+val+'" ischecked="'+checked+'" />')
							.val(val)
							.prop('checked', (checked || (!checked && i == 0) ))
						)
					input = input.add($('<label for="'+id+'-'+val+'"/>').html( title ))
				}
				break;
		}

		if( options.required ){
			input.prop('required', true)
		}

		if( options.onchange ){
			input.on('change.___onchange___', function(e){
				options.onchange( e, $(this) )
			})
			if( options['default'] )
				input.trigger('change')
		}

		if( !name )
			input.attr('name', null)

		return input
	}

	var line = $('<p/>').addClass(name).appendTo( this.dom.filters )
		,id = '_input_g' + parseInt(_g.inputIndex)

		,label = label ? $('<label for="'+id+'"/>').html( label ).appendTo(line) : null
		,input = gen_input().appendTo(line)

	if( type == 'checkbox' && label )
		label.insertAfter(input)

	if( suffix )
		$('<label for="'+id+'"/>').html(suffix).appendTo(line)

	_g.inputIndex++
	return line
}














// 表格排序相关
	// 排序表格中正在显示行中某一列(td:nth-of-type)，返回DOM Array
	// 默认降序
		_tablelist.prototype.sort_column = function( nth, is_ascending, rows ){
			if( !rows ){
				var tbody = this.dom.tbody
				if( !tbody || !tbody.length )
					tbody = this.dom.table.find('tbody')
				rows = tbody.find('tr.row:visible')
			}
			nth = nth || 1

			// 建立临时用对象，在函数结束时delete
				this._tmp_values = []
				this._tmp_value_map_cell = {}

			var self = this

			// 遍历，将值全部导出到 _tmp_values，_tmp_value_map_cell 中记录 值 -> jQuery DOM
				rows.find('td:nth-of-type(' + nth + ')').each(function(index){
					var cell = $(this)
						,val = $(this).data('value')

					val = parseFloat(val)

					if( $.inArray( val, self._tmp_values ) < 0 )
						self._tmp_values.push( val )

					if( !self._tmp_value_map_cell[val] )
						self._tmp_value_map_cell[val] = $()

					self._tmp_value_map_cell[val] = self._tmp_value_map_cell[val].add( cell )
				})

			// 排序
				this._tmp_values.sort(function(a, b){
					if( is_ascending )
						return a-b
					else
						return b-a
				})

			// 根据排序结果，整理返回结果
				var return_array = []
				for(var i in this._tmp_values){
					return_array.push( this._tmp_value_map_cell[this._tmp_values[i]] )
				}

			// delete 临时对象
				delete this._tmp_values
				delete this._tmp_value_map_cell

			return return_array
		}

	// 标记表格全部数据列中第一和第二高值的单元格
		_tablelist.prototype.mark_high = function(){
			var tbody = this.dom.tbody
			if( !tbody || !tbody.length )
				tbody = this.dom.table.find('tbody')
			var rows = tbody.find('tr.row:visible')

			rows.find('td[data-value]').removeClass('sort-first sort-second')

			rows.eq(0).find('td[data-value]').each(function(index){
				var is_ascending = false

				// 以下属性不参与该计算
					if( $(this).data('stat').match(/\b(speed|range)\b/ ) )
						return

				// 以下属性为升序
					if( $(this).data('stat').match(/\b(consum_fuel|consum_ammo)\b/ ) )
						is_ascending = true

				var sort = _tablelist.prototype.sort_column( index+1, is_ascending, rows )
					,max = Math.min( 6, Math.ceil(rows.length / 2) + 1 )

				if( sort.length > 1 && sort[0].length < max ){
					sort[0].addClass('sort-first')
					if( sort.length > 2 && sort[1].length < max )
						sort[1].addClass('sort-second')
				}

			})
		}



















_tablelist.prototype.init = function(){
	if( this.is_init )
		return true

	if( this['_' + this.listtype + '_init'] )
		this['_' + this.listtype + '_init']()

	this.is_init = true
}

// @koala-prepend "js-app/main.js"

// @koala-prepend "js-app/page/ships.js"

// @koala-prepend "js-app/frame/infos.js"

// @koala-prepend "js-app/elements/tablelist.js"
