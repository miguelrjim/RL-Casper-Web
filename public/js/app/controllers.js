angular.module('CasperWeb.Controllers', []).
controller('MainController', ['$scope', '$http', 'socketRL', '$sce', function($scope, $http, socketRL, $sce) {
	$scope.initialize = function() {
		var s=$scope.socket = socketRL;

		$scope.scripts = {};
		$scope.tests = {};
		$scope.suites = [];

		$scope.$on('socket:list', function(ev, type, list) {
			switch(type) {
				case 'scripts':
				case 'tests':
					$scope[type].list = list.map(function(el) {
						el.selected = false;
						return el;
					});
				break;
				case 'environments':
					$scope[type] = list;
					$scope.scripts.environment = $scope.tests.environment = list[0];
				break;
			}
			
		});

		$scope.$on('socket:finished', function(ev, type, file, data, screenshots, index) {
			var f=$scope.suites[index].files[file];
			f.screenshots = screenshots;
			f.status = "Success";
			console.log('finished ' + file);
			console.log(data);
		});
		$scope.$on('socket:retry', function(ev, type, file, retry, index) {
			console.log('retry #' + retry + ' ' + file);
		});
		$scope.$on('socket:err', function(ev, type, file, code, data, error, index) {
			var f=$scope.suites[index].files[file];
			f.status = "Fail";
			f.output = $sce.trustAsHtml($scope.format(data));
			f.error = true;
			console.log('error ' + file + ' ' + code);
			console.log(data);
			console.log(error);
		});
		$scope.$on('socket:gerror', function(ev, type, error, index) {
			console.log('error ' + type + ' ' + error);
		})

		s.emit('get', 'environments');
		s.emit('get', 'scripts');
		s.emit('get', 'tests');
	}

	$scope.run = function(type) {
		var f = {},
			t = $scope[type],
			selected = t.list.filter(function(el) {
				return el.selected;
			});
		selected.forEach(function(el) {
			f[el.name] = {
				status: 'running',
				screenshots: [],
				output: '',
				error: false
			};
		});
		selected = selected.map(function(el) {
			return {
				name: el.name,
				args: el.args.map(function(arg) {
					return {
						name: arg.name,
						value: arg.value
					}
				})
			}
		}); 
		$scope.suites.push({
			environment: t.environment.name,
			files: f
		})
		$scope.socket.emit('run', type, selected, t.environment, $scope.suites.length-1);
	}

	$scope.format = function(data) {
		var n='',
			t=0,
			s=/^\u001b\[([^m]+)m/,
			i=/^[^\u001b]*/,
			h,
			k,
			e,
			m,
			p,
			colors=[
				'000',
				'F00',
				'0F0',
				'FF0',
				'00F',
				'F0F',
				'0FF',
				'FFF'
			],
			open=false;
		while(t < data.length) {
			e='';
			h=s.exec(data);
			if(h) {
				if(h[1] == '0') {
					e='</span>';
					open=false;
				}
				else {
					if(open)
						e='</span>';
					open=true;
					e+='<span style="';
					k = h[1].split(';');
					for(m=0;m<k.length;m++) {
						p=parseInt(k[m]);
						if(p >= 30 && p < 40)
							e+='color:#' + colors[p-30]+';'; 
						else if(p > 40)
							e+='background-color:#' + colors[p-40] + ';';
					}
					e+='">';
				}
				n+=e;
				data = data.substr(h[0].length);
			}
			h=i.exec(data);
			if(h) {
				e=h[0];
				data = data.substr(h[0].length);
				n+=e;
			}
		}
		return n.replace(/\n/g, '<br/>');
	}

	$scope.initialize();
}]);