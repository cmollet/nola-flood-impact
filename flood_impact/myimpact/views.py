import json
import os

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView, FormView
from django.views.decorators.csrf import csrf_exempt

from myimpact.forms import AddressForm
from myimpact.models import SiteAddressPoint


class AddressFormView(FormView):
    template_name = 'myimpact/myimpact.html'
    form_class = AddressForm


class MyImpactResponse(TemplateView):
        pass


def index(request):
    return render(request, 'myimpact/index.html')


def get_address(request):
    # if request.method == "POST":
    #     form = AddressForm(request.POST)
    #     if form.is_valid():
    #         return HttpResponse('nice address!')
    # else:
    #     form = AddressForm()

    # return render(request, 'myimpact/myimpact.html', {'form': form})
    return render(request, 'myimpact/datalist.html')


def address_list(request):
    """
    Return all unique addresses in the SiteAddressPoint model
    """

    # This list of distinct addresses won't change until we re-import an updated
    # SiteAddressPoint shapefile, so for now just load a
    # JSON file of them to get around this very non-performant query
    # addresses = list(SiteAddressPoint.objects.values_list('full_address', flat=True)
    #                                          .distinct('full_address'))
    addresses = json.load(open(
        os.path.join(settings.BASE_DIR, 'myimpact/static/myimpact/addresses.json')
        ))
    return JsonResponse(addresses, safe=False)


# DJANGO...Y U NO SET COOKIE?
@csrf_exempt
def address_search(request):
    """Search for an address"""

    if request.method == "POST" and request.content_type == "application/json":

        if request.body:
            data = json.loads(request.body)
            query = data.get('query', '')

            results = SiteAddressPoint.objects.filter(full_address__search=query)\
                                              .values_list('full_address', flat=True)\
                                              .order_by('full_address')
            return JsonResponse(list(results), safe=False)


def address_detail(request, address):
    """Display the address detail view"""
    # address = get_object_or_404(SiteAddressPoint, full_address=address)
    address = SiteAddressPoint.objects.filter(full_address=address)
    # TODO: Dedupe
    if address.count() >= 1:
        return JsonResponse(address.first().json_response())
    return JsonResponse({'success': False,
                         'message': 'Could not get an exact match for {}'.format(address)
                         })
