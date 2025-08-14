from django.shortcuts import render
from django.http import JsonResponse
from .models import DataPlan, Country

def plans_list(request):
    """API endpoint para obtener todos los planes de datos activos"""
    try:
        # Agregar debug para ver todos los planes primero
        all_plans = DataPlan.objects.all()
        print(f"🔍 Debug: Total planes en DB: {all_plans.count()}")
        for plan in all_plans:
            print(f"  - {plan.name}, activo: {plan.is_active}")
        
        plans = DataPlan.objects.filter(is_active=True).select_related().prefetch_related('countries')
        print(f"🔍 Debug: Planes activos: {plans.count()}")
        
        plans_data = []
        for plan in plans:
            # Obtener nombres de países
            country_names = [country.name for country in plan.countries.all()]
            
            plan_data = {
                'id': plan.id,
                'name': plan.name,
                'description': plan.description,
                'data_amount_mb': plan.data_amount,  # Corregido: era data_amount_mb
                'validity_days': plan.validity_days,
                'price': float(plan.price),
                'discount_price': float(plan.discount_price) if plan.discount_price else None,
                'countries': country_names,
                'is_popular': plan.is_popular,
                'created_at': plan.created_at.isoformat(),
                'updated_at': plan.updated_at.isoformat(),
            }
            plans_data.append(plan_data)
        
        print(f"🔍 Debug: Datos de planes a enviar: {len(plans_data)}")
        
        return JsonResponse({
            'success': True,
            'count': len(plans_data),
            'results': plans_data
        })
    except Exception as e:
        print(f"❌ Error en plans_list: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def countries_list(request):
    """API endpoint para obtener todos los países activos"""
    try:
        countries = Country.objects.filter(is_active=True)
        
        countries_data = []
        for country in countries:
            country_data = {
                'id': country.id,
                'name': country.name,
                'iso_code': country.iso_code,
                'flag_emoji': country.flag_emoji,
                'is_active': country.is_active,
            }
            countries_data.append(country_data)
        
        return JsonResponse({
            'success': True,
            'count': len(countries_data),
            'results': countries_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
