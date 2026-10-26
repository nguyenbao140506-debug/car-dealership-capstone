from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse, HttpResponseNotFound
from django.urls import include, path, re_path
from django.views.generic import TemplateView


def frontend_index(request, *args, **kwargs):
    """Serve the built React app; explain how to start Vite during local development."""
    if (settings.FRONTEND_DIST / "index.html").is_file():
        return TemplateView.as_view(template_name="index.html")(request, *args, **kwargs)
    if settings.DEBUG:
        return HttpResponse(
            "<h1>Car Dealership Capstone API</h1>"
            "<p>Start the React frontend with <code>npm run dev</code> in server/frontend.</p>"
            '<p><a href="/djangoapp/health">API health</a></p>'
        )
    return HttpResponseNotFound("Frontend build is missing.")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("dealerships.urls")),
    path("", frontend_index, name="home"),
    re_path(r"^(?!admin/|djangoapp/|static/).*$", frontend_index, name="frontend-route"),
]
